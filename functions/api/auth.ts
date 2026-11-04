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
    const { action, email, password, newPassword, name, resetCode, userId } = body;

    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const isAdminUser = cleanEmail === 'angelhv2003@gmail.com' || cleanEmail === 'admin@myfridge.pages.dev';

    // 1. SOLICITAR CÓDIGO DE RECUPERACIÓN POR EMAIL
    if (action === 'request-reset') {
      if (!cleanEmail) {
        return new Response(JSON.stringify({ error: 'Introduce tu correo' }), { status: 400 });
      }

      const user = await env.DB.prepare('SELECT id, email FROM users WHERE email = ?')
        .bind(cleanEmail)
        .first<any>();

      if (!user) {
        return new Response(JSON.stringify({ error: 'No existe ninguna cuenta con este correo' }), { status: 404 });
      }

      // Generar código de 6 dígitos con validez de 15 minutos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000;

      await env.DB.prepare('UPDATE users SET reset_code = ?, reset_expires = ? WHERE id = ?')
        .bind(code, expiresAt, user.id)
        .run();

      // En entorno Cloudflare se envía el correo o se retorna para la simulación
      return new Response(
        JSON.stringify({
          success: true,
          message: `Hemos enviado el código de verificación a ${cleanEmail}. (Para pruebas tu código es: ${code})`,
          demoCode: code,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. CONFIRMAR RESTABLECIMIENTO DE CONTRASEÑA CON CÓDIGO
    if (action === 'confirm-reset') {
      if (!cleanEmail || !resetCode || !newPassword || newPassword.length < 6) {
        return new Response(JSON.stringify({ error: 'Datos incompletos o contraseña muy corta' }), { status: 400 });
      }

      const user = await env.DB.prepare('SELECT id, reset_code, reset_expires FROM users WHERE email = ?')
        .bind(cleanEmail)
        .first<any>();

      if (!user || user.reset_code !== resetCode.trim()) {
        return new Response(JSON.stringify({ error: 'Código de verificación incorrecto' }), { status: 400 });
      }

      if (user.reset_expires && Date.now() > user.reset_expires) {
        return new Response(JSON.stringify({ error: 'El código ha caducado. Pide uno nuevo.' }), { status: 400 });
      }

      const newSalt = crypto.randomUUID();
      const newHash = await hashPassword(newPassword, newSalt);

      await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ?, reset_code = NULL, reset_expires = NULL WHERE id = ?')
        .bind(newHash, newSalt, user.id)
        .run();

      return new Response(
        JSON.stringify({ success: true, message: '¡Contraseña restablecida correctamente! Ya puedes entrar.' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. MODIFICAR PERFIL Y CAMBIAR CONTRASEÑA DESDE DENTRO DE LA APP
    if (action === 'update-profile') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });
      }

      const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
        .bind(userId)
        .first<any>();

      if (!user) {
        return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
      }

      // Si quiere cambiar contraseña, verificar la actual
      let updateHash = user.password_hash;
      let updateSalt = user.salt;

      if (newPassword) {
        if (!password) {
          return new Response(JSON.stringify({ error: 'Debes indicar tu contraseña actual' }), { status: 400 });
        }
        const verifyCurrent = await hashPassword(password, user.salt);
        if (verifyCurrent !== user.password_hash) {
          return new Response(JSON.stringify({ error: 'La contraseña actual no es correcta' }), { status: 400 });
        }
        updateSalt = crypto.randomUUID();
        updateHash = await hashPassword(newPassword, updateSalt);
      }

      const updatedName = name !== undefined ? name.trim() : user.name;

      await env.DB.prepare('UPDATE users SET name = ?, password_hash = ?, salt = ? WHERE id = ?')
        .bind(updatedName, updateHash, updateSalt, user.id)
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: updatedName,
            isAdmin: Boolean(user.is_admin),
          },
          message: 'Perfil y contraseña actualizados correctamente',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. REGISTRO DE CUENTA
    if (action === 'register') {
      if (!cleanEmail || !password || password.length < 6) {
        return new Response(JSON.stringify({ error: 'Email válido y contraseña (mínimo 6 caracteres) requeridos' }), {
          status: 400,
        });
      }

      const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(cleanEmail)
        .first();

      if (existingUser) {
        return new Response(JSON.stringify({ error: 'Ya existe una cuenta con este correo' }), { status: 409 });
      }

      const salt = crypto.randomUUID();
      const passwordHash = await hashPassword(password, salt);
      const newUserId = 'usr_' + crypto.randomUUID();
      const now = Date.now();

      await env.DB.prepare(`
        INSERT INTO users (id, email, password_hash, salt, name, is_admin, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
        .bind(newUserId, cleanEmail, passwordHash, salt, name || cleanEmail.split('@')[0], isAdminUser ? 1 : 0, now, now)
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: newUserId,
            email: cleanEmail,
            name: name || cleanEmail.split('@')[0],
            isAdmin: isAdminUser,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. INICIO DE SESIÓN (LOGIN)
    if (action === 'login') {
      if (!cleanEmail || !password) {
        return new Response(JSON.stringify({ error: 'Email y contraseña requeridos' }), { status: 400 });
      }

      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
        .bind(cleanEmail)
        .first<any>();

      if (!user) {
        return new Response(JSON.stringify({ error: 'No existe ninguna cuenta con este correo' }), { status: 404 });
      }

      const checkHash = await hashPassword(password, user.salt);
      if (checkHash !== user.password_hash) {
        return new Response(JSON.stringify({ error: 'Contraseña incorrecta' }), { status: 401 });
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
