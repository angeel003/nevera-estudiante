interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
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

// Asegura que existan las columnas de verificación de correo en la tabla users
async function ensureVerificationColumns(db: D1Database) {
  try {
    await db.prepare('ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0').run();
  } catch (e) { /* Columna ya existente */ }
  try {
    await db.prepare('ALTER TABLE users ADD COLUMN verification_code TEXT').run();
  } catch (e) { /* Columna ya existente */ }
  try {
    await db.prepare('ALTER TABLE users ADD COLUMN verification_expires INTEGER').run();
  } catch (e) { /* Columna ya existente */ }
}

// Envía un correo electrónico real usando la API de Resend si está configurada la variable RESEND_API_KEY
async function sendSecurityEmail(env: Env, toEmail: string, code: string, subject: string, title: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nevera Estudiante <onboarding@resend.dev>',
        to: [toEmail],
        subject: subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 36px;">🧊</span>
              <h2 style="color: #0f172a; margin: 8px 0 0; font-size: 20px;">Nevera Estudiante</h2>
            </div>
            <h3 style="color: #059669; font-size: 16px; margin-top: 0;">${title}</h3>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">
              Usa el siguiente código de seguridad de 6 dígitos para verificar tu cuenta en la aplicación:
            </p>
            <div style="background-color: #f8fafc; border: 2px dashed #059669; border-radius: 12px; padding: 16px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #0f172a; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
              Este código caducará en 15 minutos. Si tú no has solicitado este código, puedes ignorar este mensaje con total seguridad.
            </p>
          </div>
        `,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('Error enviando correo via Resend API:', err);
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body: any = await request.json();
    const { action, email, password, newPassword, name, resetCode, code, userId, adminKey } = body;

    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const isAdminUser = cleanEmail === 'angelhv2003@gmail.com' || cleanEmail === 'admin@myfridge.pages.dev';

    await ensureVerificationColumns(env.DB);

    // 1. SOLICITAR CÓDIGO DE RECUPERACIÓN POR EMAIL (FORGOT PASSWORD)
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
      const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000;

      await env.DB.prepare('UPDATE users SET reset_code = ?, reset_expires = ? WHERE id = ?')
        .bind(resetOtp, expiresAt, user.id)
        .run();

      const emailSent = await sendSecurityEmail(
        env,
        cleanEmail,
        resetOtp,
        'Código de recuperación de contraseña - Nevera Estudiante',
        'Recuperación de contraseña'
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: emailSent
            ? `Hemos enviado un correo a ${cleanEmail} con tu código de recuperación.`
            : `Código generado. (Para recibir emails reales en tu bandeja de entrada configura RESEND_API_KEY en Cloudflare. Modo pruebas: ${resetOtp})`,
          demoCode: emailSent ? undefined : resetOtp,
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

    // 3. VERIFICAR CORREO CON CÓDIGO DE 6 DÍGITOS (OTP) TRAS REGISTRO
    if (action === 'verify-email') {
      const inputCode = (code || resetCode || '').trim();
      if (!cleanEmail || !inputCode) {
        return new Response(JSON.stringify({ error: 'Email y código de verificación requeridos' }), { status: 400 });
      }

      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
        .bind(cleanEmail)
        .first<any>();

      if (!user) {
        return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
      }

      // Validar código (o código de recuperación/verificación)
      const validCode = user.verification_code || user.reset_code;
      const validExpires = user.verification_expires || user.reset_expires;

      if (!validCode || validCode !== inputCode) {
        return new Response(JSON.stringify({ error: 'Código de verificación incorrecto' }), { status: 400 });
      }

      if (validExpires && Date.now() > validExpires) {
        return new Response(JSON.stringify({ error: 'El código ha caducado. Pulsa en reenviar código.' }), { status: 400 });
      }

      const now = Date.now();
      await env.DB.prepare(`
        UPDATE users 
        SET email_verified = 1, verification_code = NULL, verification_expires = NULL, reset_code = NULL, reset_expires = NULL, last_login = ?
        WHERE id = ?
      `)
        .bind(now, user.id)
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
          message: '¡Cuenta verificada con éxito!',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. REENVIAR CÓDIGO DE VERIFICACIÓN DE EMAIL
    if (action === 'resend-verification') {
      if (!cleanEmail) {
        return new Response(JSON.stringify({ error: 'Email requerido' }), { status: 400 });
      }

      const user = await env.DB.prepare('SELECT id, email FROM users WHERE email = ?')
        .bind(cleanEmail)
        .first<any>();

      if (!user) {
        return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
      }

      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000;

      await env.DB.prepare(`
        UPDATE users 
        SET verification_code = ?, verification_expires = ?, reset_code = ?, reset_expires = ?
        WHERE id = ?
      `)
        .bind(newOtp, expiresAt, newOtp, expiresAt, user.id)
        .run();

      const emailSent = await sendSecurityEmail(
        env,
        cleanEmail,
        newOtp,
        'Código de verificación - Nevera Estudiante',
        'Verificación de correo'
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: emailSent
            ? `Hemos reenviado un nuevo código a ${cleanEmail}.`
            : `Código generado. (Para pruebas tu código es: ${newOtp})`,
          demoCode: emailSent ? undefined : newOtp,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. MODIFICAR PERFIL Y CAMBIAR CONTRASEÑA DESDE DENTRO DE LA APP
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
      let newHash = user.password_hash;
      let newSalt = user.salt;

      if (newPassword && newPassword.length >= 6) {
        if (!password) {
          return new Response(JSON.stringify({ error: 'Debes introducir tu contraseña actual para cambiarla' }), {
            status: 400,
          });
        }
        const checkHash = await hashPassword(password, user.salt);
        if (checkHash !== user.password_hash) {
          return new Response(JSON.stringify({ error: 'La contraseña actual no es correcta' }), { status: 401 });
        }

        newSalt = crypto.randomUUID();
        newHash = await hashPassword(newPassword, newSalt);
      }

      const updatedName = name !== undefined ? name : user.name;

      await env.DB.prepare('UPDATE users SET name = ?, password_hash = ?, salt = ? WHERE id = ?')
        .bind(updatedName, newHash, newSalt, user.id)
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

    // 6. REGISTRO DE CUENTA CON VERIFICACIÓN OBLIGATORIA
    if (action === 'register') {
      if (!cleanEmail || !password || password.length < 6) {
        return new Response(JSON.stringify({ error: 'Email válido y contraseña (mínimo 6 caracteres) requeridos' }), {
          status: 400,
        });
      }

      // Protección especial: evitar que un extraño registre el correo de administración
      if (isAdminUser) {
        const existingAdmin = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
          .bind(cleanEmail)
          .first();
        if (existingAdmin) {
          return new Response(JSON.stringify({ error: 'La cuenta de administrador ya está creada. Inicia sesión.' }), { status: 409 });
        }
      }

      const existingUser = await env.DB.prepare('SELECT id, email_verified FROM users WHERE email = ?')
        .bind(cleanEmail)
        .first<any>();

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000;
      const salt = crypto.randomUUID();
      const passwordHash = await hashPassword(password, salt);
      const now = Date.now();

      if (existingUser) {
        if (existingUser.email_verified === 1) {
          return new Response(JSON.stringify({ error: 'Ya existe una cuenta verificada con este correo. Inicia sesión.' }), { status: 409 });
        }
        // Usuario previo no verificado: actualizar credenciales y enviar nuevo código
        await env.DB.prepare(`
          UPDATE users 
          SET password_hash = ?, salt = ?, name = ?, verification_code = ?, verification_expires = ?, reset_code = ?, reset_expires = ?
          WHERE id = ?
        `)
          .bind(passwordHash, salt, name || cleanEmail.split('@')[0], otp, expiresAt, otp, expiresAt, existingUser.id)
          .run();

        const emailSent = await sendSecurityEmail(
          env,
          cleanEmail,
          otp,
          'Verifica tu correo - Nevera Estudiante',
          'Activación de tu cuenta'
        );

        return new Response(
          JSON.stringify({
            success: true,
            needsVerification: true,
            email: cleanEmail,
            message: emailSent
              ? `Hemos enviado un código de 6 dígitos a ${cleanEmail} para verificar que es tu correo.`
              : `Código generado. (Configura RESEND_API_KEY para correos reales. Modo pruebas: ${otp})`,
            demoCode: emailSent ? undefined : otp,
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      const newUserId = 'usr_' + crypto.randomUUID();

      // Guardar con email_verified = 0 y código de verificación
      await env.DB.prepare(`
        INSERT INTO users (id, email, password_hash, salt, name, is_admin, email_verified, verification_code, verification_expires, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
      `)
        .bind(
          newUserId,
          cleanEmail,
          passwordHash,
          salt,
          name || cleanEmail.split('@')[0],
          isAdminUser ? 1 : 0,
          otp,
          expiresAt,
          now,
          now
        )
        .run();

      const emailSent = await sendSecurityEmail(
        env,
        cleanEmail,
        otp,
        'Verifica tu correo - Nevera Estudiante',
        'Activación de tu cuenta'
      );

      return new Response(
        JSON.stringify({
          success: true,
          needsVerification: true,
          email: cleanEmail,
          message: emailSent
            ? `Hemos enviado un código de 6 dígitos a ${cleanEmail} para verificar que es tu correo.`
            : `Código generado. (Configura RESEND_API_KEY en Cloudflare para correos reales. Modo pruebas: ${otp})`,
          demoCode: emailSent ? undefined : otp,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 7. INICIO DE SESIÓN (LOGIN)
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

      // Si la cuenta aún no ha sido verificada, bloquear acceso y enviar código
      if (user.email_verified === 0) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000;

        await env.DB.prepare(`
          UPDATE users 
          SET verification_code = ?, verification_expires = ?
          WHERE id = ?
        `)
          .bind(otp, expiresAt, user.id)
          .run();

        const emailSent = await sendSecurityEmail(
          env,
          cleanEmail,
          otp,
          'Verifica tu correo - Nevera Estudiante',
          'Activación de tu cuenta'
        );

        return new Response(
          JSON.stringify({
            error: 'Debes verificar tu correo antes de poder acceder.',
            needsVerification: true,
            email: cleanEmail,
            demoCode: emailSent ? undefined : otp,
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
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
