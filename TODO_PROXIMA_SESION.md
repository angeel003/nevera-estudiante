# 📋 Hoja de Ruta y Tareas Pendientes para la Próxima Sesión

---

### 1. 🔍 Integración de Tesseract.js (Motor OCR móvil en el navegador)
- [x] **Librería Tesseract.js**: Instalado `tesseract.js` para procesamiento 100% en el cliente (móviles y PC).
- [x] **Modelo en Español**: Configurado worker con paquete de datos `spa` + `eng` (idioma español y números).
- [x] **Filtros de Pre-procesado en Canvas**:
  - Filtro de umbralización / blanco y negro (binarización).
  - Aumento de contraste para minimizar confusiones habituales en tickets arrugados (ej: confundir `B` con `8`, o `0` con `O`).
- [x] **Pipeline de Extracción**: Pasa el texto reconocido directamente a `parseReceiptText()` con barra de progreso en vivo y alimenta `TicketReviewTab`.

---

### 2. 🛡️ Control de Permisos de Administrador (Verificado y Asegurado)
- [x] **Regla de registro**: Al registrarse nuevos usuarios, el campo `is_admin` se guarda en **`0`** en la base de datos Cloudflare D1.
- [x] **Lista blanca exclusiva (`ADMIN_EMAILS`)**:
  - `angelhv2003@gmail.com`
  - `admin@myfridge.pages.dev`
- [x] **Panel de Administración**: Oculto e inaccesible para cualquier usuario que no esté en la lista blanca de administradores autorizados.

---

### 3. 📧 Verificación de Correo Real y Prevención de Suplantación de Identidad
- [x] **Código OTP de 6 dígitos por Email:**
  - Al registrarse, el usuario entra en estado pendiente de verificación.
  - Se genera un código OTP de 6 dígitos con 15 minutos de caducidad.
  - Pantalla interactiva en la app para introducir el código de 6 dígitos con botón para reenviar si no llega.
  - Si un usuario no verificado intenta iniciar sesión, se le bloquea el acceso y se le solicita la verificación.
- [x] **Protección Inmediata para el Administrador:**
  - Protección en el backend que prohíbe que extraños intenten registrar tu correo de administrador (`angelhv2003@gmail.com`).
