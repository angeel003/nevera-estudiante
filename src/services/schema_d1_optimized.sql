-- Esquema optimizado para Cloudflare D1 (SQLite en Edge)
-- Reducción drástica de Lecturas (Reads) y Escrituras (Writes)

-- 1. Tabla de Usuarios y sus Metadatos
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL,
    last_sync INTEGER DEFAULT 0
);

-- 2. Catálogo global compartido de Alimentos por Supermercado
-- (Se cachea en el Edge CDN / Cloudflare Cache API mediante cabeceras Cache-Control: public, max-age=86400)
-- ¡Al estar cacheado en Cloudflare CDN, las lecturas dan 0 coste de lectura en D1!
CREATE TABLE IF NOT EXISTS supermarket_catalog (
    id TEXT PRIMARY KEY,
    supermarket_id TEXT NOT NULL, -- 'mercadona', 'dia', 'carrefour', 'lidl', etc.
    alias_pattern TEXT NOT NULL,  -- 'leche enter', 'huev.camp'
    normalized_name TEXT NOT NULL,-- 'Leche Entera Hacendado'
    category TEXT NOT NULL,
    default_unit TEXT DEFAULT 'uds',
    estimated_price REAL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_catalog_supermarket ON supermarket_catalog(supermarket_id);

-- 3. Nevera / Despensa de cada usuario
CREATE TABLE IF NOT EXISTS pantry_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    price REAL,
    expiry_date TEXT,
    is_frozen INTEGER DEFAULT 0,
    is_prepared INTEGER DEFAULT 0,
    servings INTEGER,
    notes TEXT,
    nutrition_json TEXT, -- Objeto JSON empaquetado para no crear tablas secundarias ni hacer JOINs caros
    updated_at INTEGER NOT NULL, -- Timestamp para sincronización delta incremental
    is_deleted INTEGER DEFAULT 0 -- Soft-delete para propagar borrados con 0 pérdidas
);

-- Índice compuesto para que una sincronización 'SELECT WHERE user_id = ? AND updated_at > ?'
-- sea de complejidad O(log N) y consuma el mínimo absoluto de filas leídas en D1
CREATE INDEX IF NOT EXISTS idx_pantry_sync ON pantry_items(user_id, updated_at);

-- 4. Lista de la compra por usuario
CREATE TABLE IF NOT EXISTS shopping_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    estimated_price REAL,
    checked INTEGER DEFAULT 0,
    updated_at INTEGER NOT NULL,
    is_deleted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_shopping_sync ON shopping_items(user_id, updated_at);

-- 5. Recetas del usuario
CREATE TABLE IF NOT EXISTS user_recipes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    servings INTEGER NOT NULL,
    cooking_time_minutes INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    ingredients_json TEXT NOT NULL, -- JSON empaquetado (menos escrituras y menos filas en D1)
    steps_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    is_deleted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_recipes_sync ON user_recipes(user_id, updated_at);

