interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'usr_guest';

    // Obtener recetas del usuario o recetas de la comunidad desde D1
    const { results } = await env.DB.prepare(`
      SELECT * FROM user_recipes 
      WHERE (user_id = ? OR user_id = 'global' OR user_id = 'usr_guest')
        AND is_deleted = 0
      ORDER BY updated_at DESC
    `).bind(userId).all<any>();

    const recipes = (results || []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      servings: row.servings || 2,
      cookingTimeMinutes: row.cook_time_minutes || 20,
      prepTimeMinutes: row.prep_time_minutes || 0,
      difficulty: row.difficulty || 'fácil',
      ingredients: JSON.parse(row.ingredients_json || '[]'),
      steps: JSON.parse(row.steps_json || '[]'),
      updatedAt: row.updated_at
    }));

    return new Response(JSON.stringify({ success: true, recipes }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, recipes: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body: any = await request.json();
    const { userId = 'usr_guest', recipe } = body;

    if (!recipe || !recipe.title) {
      return new Response(JSON.stringify({ error: 'Receta inválida' }), { status: 400 });
    }

    const recipeId = recipe.id || 'rec_' + Date.now();
    const title = recipe.title;
    const description = recipe.description || '';
    const servings = Number(recipe.servings) || 2;
    const cookTime = Number(recipe.cookingTimeMinutes) || 20;
    const prepTime = Number(recipe.prepTimeMinutes) || 0;
    const difficulty = recipe.difficulty || 'fácil';
    const ingredientsJson = JSON.stringify(recipe.ingredients || []);
    const stepsJson = JSON.stringify(recipe.steps || []);
    const now = Date.now();

    await env.DB.prepare(`
      INSERT INTO user_recipes (id, user_id, title, description, servings, cook_time_minutes, prep_time_minutes, difficulty, ingredients_json, steps_json, updated_at, is_deleted)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 0)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        servings = excluded.servings,
        cook_time_minutes = excluded.cook_time_minutes,
        prep_time_minutes = excluded.prep_time_minutes,
        difficulty = excluded.difficulty,
        ingredients_json = excluded.ingredients_json,
        steps_json = excluded.steps_json,
        updated_at = excluded.updated_at,
        is_deleted = 0
    `).bind(
      recipeId,
      userId,
      title,
      description,
      servings,
      cookTime,
      prepTime,
      difficulty,
      ingredientsJson,
      stepsJson,
      now
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Receta guardada en D1', recipeId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const userId = url.searchParams.get('userId') || 'usr_guest';

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID de receta requerido' }), { status: 400 });
    }

    await env.DB.prepare(`
      UPDATE user_recipes SET is_deleted = 1, updated_at = ?3 WHERE id = ?1 AND user_id = ?2
    `).bind(id, userId, Date.now()).run();

    return new Response(JSON.stringify({ success: true, message: 'Receta eliminada de D1' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

