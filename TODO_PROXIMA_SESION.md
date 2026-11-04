# 📋 Hoja de Ruta y Tareas Pendientes para la Próxima Sesión

---

### 1. 🔍 Integración de Tesseract.js (Motor OCR móvil en el navegador)
- [ ] **Librería Tesseract.js**: Instalar `tesseract.js` para procesamiento 100% en el cliente (móviles y PC).
- [ ] **Modelo en Español**: Configurar worker con paquete de datos `spa` (idioma español).
- [ ] **Filtros de Pre-procesado en Canvas**:
  - Filtro de umbralización / blanco y negro (binarización).
  - Aumento de contraste para minimizar confusiones habituales en tickets arrugados (ej: confundir `B` con `8`, o `0` con `O`).
- [ ] **Pipeline de Extracción**: Pasar el texto reconocido directamente a `parseReceiptText()` y alimentar `TicketReviewTab`.

---

### 2. 🛡️ Control de Permisos de Administrador (Verificado y Asegurado)
- [x] **Regla de registro**: Al registrarse nuevos usuarios, el campo `is_admin` se guarda en **`0`** en la base de datos Cloudflare D1.
- [x] **Lista blanca exclusiva (`ADMIN_EMAILS`)**:
  - `angelhv2003@gmail.com`
  - `admin@myfridge.pages.dev`
- [ ] **Panel de Administración**: Mantener oculto e inaccesible para cualquier usuario que no esté en la lista blanca de administradores autorizados.

---

### 3. 📧 Verificación de Correo Real y Prevención de Suplantación de Identidad
**El problema:** Si alguien escribe un correo inventado o el correo de otra persona (ej: `otra_persona@gmail.com`), podría registrar una cuenta sin demostrar que ese email le pertenece.

**Soluciones planteadas para resolverlo mañana:**
- [ ] **Opción A (Recomendada - Código OTP de 6 dígitos por Email):**
  1. Al darle a *Registrarme*, el usuario no entra directamente.
  2. La base de datos crea el usuario en estado `email_verified = 0` y genera un código de 6 dígitos aleatorio con caducidad de 15 minutos (`verification_code`).
  3. Se envía el código al email introducido (usando **Resend** o **Cloudflare Email**, que son 100% gratuitos hasta miles de emails al mes).
  4. La app muestra una pantalla: *"Introduce el código de 6 dígitos que te hemos enviado a tu correo"*.
  5. Solo cuando el usuario escribe el código correcto, la cuenta pasa a `email_verified = 1` y se le permite entrar. Si no es su correo, nunca recibirá el código y la cuenta quedará bloqueada/eliminada.
- [ ] **Opción B (Botón "Continuar con Google" / OAuth):**
  - Integra el botón oficial de Google. Como el usuario se autentica directamente con su cuenta de Google, Google nos garantiza al 100% que ese correo es suyo sin necesidad de enviar emails.
- [ ] **Protección Inmediata para el Administrador:**
  - Prohibir en el backend que nadie ajeno pueda registrarse con tu correo de administrador (`angelhv2003@gmail.com`) a menos que introduzca una clave de seguridad maestra o tu cuenta esté ya creada de antemano.
