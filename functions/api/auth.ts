interface Env {
  DB: D1Database;
}

// Genera un hash seguro mediante SHA-256 (Web Crypto API disponible en Cloudflare Workers)
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password + salt),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign']
  );
  const rawKey = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(rawKey))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body: any = await request.json();
    const { action, email, password, name } = body;

    if (!email || !password || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email y contraseña requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isAdminUser = cleanEmail === 'angelhv2003@gmail.com' || cleanEmail === 'admin@myfridge.pages.dev';

    // REGISTRO DE CUENTA
    if (action === 'register') {
      const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(cleanEmail)
        .first();

      if (existingUser) {
        return new Response(JSON.stringify({ error: 'Ya existe una cuenta con este correo' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const salt = crypto.randomUUID();
      const passwordHash = await hashPassword(password, salt);
      const userId = 'usr_' + crypto.randomUUID();
      const now = Date.now();

      await env.DB.prepare(`
        INSERT INTO users (id, email, password_hash, salt, name, is_admin, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
        .bind(userId, cleanEmail, passwordHash, salt, name || cleanEmail.split('@')[0], isAdminUser ? 1 : 0, now, now)
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: userId,
            email: cleanEmail,
            name: name || cleanEmail.split('@')[0],
            isAdmin: isAdminUser,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // INICIO DE SESIÓN (LOGIN)
    if (action === 'login') {
      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
        .bind(cleanEmail)
        .first<any>();

      if (!user) {
        return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const checkHash = await hashPassword(password, user.salt);
      if (checkHash !== user.password_hash) {
        return new Response(JSON.stringify({ error: 'Contraseña incorrecta' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?')
        .bind(Date.now(), user.id)
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: Boolean(user.is_admin || isAdminUser),
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: 'Acción no soportada' }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
