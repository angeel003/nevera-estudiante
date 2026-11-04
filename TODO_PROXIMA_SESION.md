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
