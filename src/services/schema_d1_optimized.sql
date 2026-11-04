-- Esquema optimizado para Cloudflare D1 (SQLite en Edge)
-- Incluye autenticación con contraseñas seguras (PBKDF2/SHA-256) y catálogo orgánico

-- 1. Tabla de Usuarios y Credenciales
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    name TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_login INTEGER DEFAULT 0
);

-- 2. Catálogo global compartido de Alimentos por Supermercado
-- Se llena orgánicamente con las aprobaciones del Administrador y los tickets verificados
CREATE TABLE IF NOT EXISTS supermarket_catalog (
    id TEXT PRIMARY KEY,
    supermarket_id TEXT NOT NULL, -- 'mercadona', 'dia', 'carrefour', 'lidl', etc.
    alias_pattern TEXT NOT NULL,  -- 'leche enter', 'huev.camp'
    normalized_name TEXT NOT NULL,-- 'Leche Entera Hacendado'
    category TEXT NOT NULL,
    default_unit TEXT DEFAULT 'uds',
    estimated_price REAL,
    price_per_kg REAL,
    updated_at INTEGER NOT NULL,
    approved_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_catalog_supermarket ON supermarket_catalog(supermarket_id);

-- 3. Propuestas de alimentos pendientes de moderación
CREATE TABLE IF NOT EXISTS food_proposals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT,
    name TEXT NOT NULL,
    supermarket TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    price REAL,
    price_per_kg REAL,
    raw_text TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    duplicate_suspect_json TEXT,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_proposals_status ON food_proposals(status);

-- 4. Nevera / Despensa de cada usuario (Privada)
CREATE TABLE IF NOT EXISTS pantry_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    price REAL,
    price_per_kg REAL,
    package_weight_grams REAL,
    expiry_date TEXT,
    is_frozen INTEGER DEFAULT 0,
    is_prepared INTEGER DEFAULT 0,
    servings INTEGER,
    notes TEXT,
    nutrition_json TEXT,
    updated_at INTEGER NOT NULL,
    is_deleted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pantry_sync ON pantry_items(user_id, updated_at);

-- 5. Lista de la compra por usuario
CREATE TABLE IF NOT EXISTS shopping_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    estimated_price REAL,
    price_per_kg REAL,
    assigned_supermarket TEXT,
    assigned_product_name TEXT,
    checked INTEGER DEFAULT 0,
    updated_at INTEGER NOT NULL,
    is_deleted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_shopping_sync ON shopping_items(user_id, updated_at);

-- 6. Recetas del usuario (con instrucciones, pasos y tiempos detallados)
CREATE TABLE IF NOT EXISTS user_recipes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    servings INTEGER NOT NULL,
    cooking_time_minutes INTEGER NOT NULL,
    prep_time_minutes INTEGER DEFAULT 0,
    difficulty TEXT NOT NULL,
    ingredients_json TEXT NOT NULL,
    steps_json TEXT NOT NULL, -- Array de pasos con instrucciones detalladas
    updated_at INTEGER NOT NULL,
    is_deleted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_recipes_sync ON user_recipes(user_id, updated_at);
