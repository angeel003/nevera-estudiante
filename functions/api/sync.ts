interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body: any = await request.json();
    const { userId, batch } = body;

    if (!userId || !Array.isArray(batch)) {
      return new Response(JSON.stringify({ error: 'Payload inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ejecución en una sola transacción SQL en D1 (máxima optimización de costes y writes)
    const statements: D1PreparedStatement[] = [];

    for (const item of batch) {
      const { table, action, data } = item;

      if (table === 'pantry_items') {
        if (action === 'upsert') {
          statements.push(
            env.DB.prepare(`
              INSERT INTO pantry_items (id, user_id, name, category, quantity, unit, price, expiry_date, is_frozen, is_prepared, servings, notes, nutrition_json, updated_at, is_deleted)
              VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, 0)
              ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                category=excluded.category,
                quantity=excluded.quantity,
                unit=excluded.unit,
                price=excluded.price,
                expiry_date=excluded.expiry_date,
                is_frozen=excluded.is_frozen,
                is_prepared=excluded.is_prepared,
                servings=excluded.servings,
                notes=excluded.notes,
                nutrition_json=excluded.nutrition_json,
                updated_at=excluded.updated_at,
                is_deleted=0
            `).bind(
              data.id,
              userId,
              data.name,
              data.category,
              data.quantity,
              data.unit,
              data.price ?? null,
              data.expiryDate ?? null,
              data.isFrozen ? 1 : 0,
              data.isPreparedMeal ? 1 : 0,
              data.servings ?? null,
              data.notes ?? null,
              data.nutrition ? JSON.stringify(data.nutrition) : null,
              data.updatedAt || Date.now()
            )
          );
        } else if (action === 'delete') {
          statements.push(
            env.DB.prepare(`
              UPDATE pantry_items SET is_deleted = 1, updated_at = ?2 WHERE id = ?1 AND user_id = ?3
            `).bind(data.id, Date.now(), userId)
          );
        }
      } else if (table === 'shopping_items') {
        if (action === 'upsert') {
          statements.push(
            env.DB.prepare(`
              INSERT INTO shopping_items (id, user_id, name, category, quantity, unit, estimated_price, checked, updated_at, is_deleted)
              VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 0)
              ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                category=excluded.category,
                quantity=excluded.quantity,
                unit=excluded.unit,
                estimated_price=excluded.estimated_price,
                checked=excluded.checked,
                updated_at=excluded.updated_at,
                is_deleted=0
            `).bind(
              data.id,
              userId,
              data.name,
              data.category,
              data.quantity,
              data.unit,
              data.estimatedPrice ?? null,
              data.checked ? 1 : 0,
              data.updatedAt || Date.now()
            )
          );
        } else if (action === 'delete') {
          statements.push(
            env.DB.prepare(`
              UPDATE shopping_items SET is_deleted = 1, updated_at = ?2 WHERE id = ?1 AND user_id = ?3
            `).bind(data.id, Date.now(), userId)
          );
        }
      }
    }

    if (statements.length > 0) {
      // batch ejecuta todas las sentencias en un solo viaje a D1
      await env.DB.batch(statements);
    }

    return new Response(JSON.stringify({ success: true, count: statements.length, serverTimestamp: Date.now() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

