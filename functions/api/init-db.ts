interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  // Permitir la inicialización desde el panel admin o con la clave secreta
  if (key !== 'admin' && key !== 'myfridge-init-2026') {
    return new Response(JSON.stringify({ error: 'No autorizado. Se requiere parámetro key=admin o key=myfridge-init-2026' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const statements = [
    `DROP TABLE IF EXISTS users;`,
    `DROP TABLE IF EXISTS supermarket_catalog;`,
    `DROP TABLE IF EXISTS food_proposals;`,
    `DROP TABLE IF EXISTS pantry_items;`,
    `DROP TABLE IF EXISTS shopping_items;`,
    `DROP TABLE IF EXISTS user_recipes;`,
    `CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        name TEXT,
        reset_code TEXT,
        reset_expires INTEGER,
        is_admin INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        last_login INTEGER DEFAULT 0
    );`,
    `CREATE TABLE supermarket_catalog (
        id TEXT PRIMARY KEY,
        supermarket_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        price REAL NOT NULL,
        unit_measure TEXT NOT NULL,
        is_essential INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
    );`,
    `CREATE INDEX IF NOT EXISTS idx_catalog_supermarket ON supermarket_catalog(supermarket_id);`,
    `CREATE TABLE food_proposals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT,
        supermarket_id TEXT,
        name TEXT NOT NULL,
        category TEXT,
        quantity REAL,
        unit TEXT,
        price REAL,
        price_per_kg REAL,
        raw_text TEXT,
        status TEXT DEFAULT 'pending',
        duplicate_suspect_json TEXT,
        created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE pantry_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        household_id TEXT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        location TEXT DEFAULT 'nevera',
        is_vault INTEGER DEFAULT 0,
        owner_name TEXT,
        expiration_date TEXT,
        price REAL,
        price_per_kg REAL,
        added_date TEXT NOT NULL,
        is_opened INTEGER DEFAULT 0,
        notes TEXT,
        supermarket_id TEXT,
        is_staple INTEGER DEFAULT 0,
        updated_at INTEGER NOT NULL,
        is_deleted INTEGER DEFAULT 0
    );`,
    `CREATE INDEX IF NOT EXISTS idx_pantry_user ON pantry_items(user_id);`,
    `CREATE TABLE shopping_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        checked INTEGER DEFAULT 0,
        estimated_price REAL,
        price_per_kg REAL,
        supermarket_id TEXT,
        added_from TEXT,
        updated_at INTEGER NOT NULL,
        is_deleted INTEGER DEFAULT 0
    );`,
    `CREATE INDEX IF NOT EXISTS idx_shopping_user ON shopping_items(user_id);`,
    `CREATE TABLE user_recipes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        servings INTEGER NOT NULL,
        cook_time_minutes INTEGER NOT NULL,
        prep_time_minutes INTEGER DEFAULT 0,
        difficulty TEXT NOT NULL,
        ingredients_json TEXT NOT NULL,
        steps_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        is_deleted INTEGER DEFAULT 0
    );`,
    `CREATE INDEX IF NOT EXISTS idx_recipes_user ON user_recipes(user_id);`
  ];

  try {
    const executed = [];
    for (const sql of statements) {
      await env.DB.prepare(sql).run();
      executed.push(sql.substring(0, 30) + '...');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '¡Todas las tablas e índices han sido creados correctamente en Cloudflare D1!',
        executedQueries: executed.length,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err.message || 'Error al ejecutar SQL en Cloudflare D1',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

