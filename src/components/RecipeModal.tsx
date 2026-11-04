import React from 'react';
import { ChefHat, X, ListOrdered } from 'lucide-react';
import type { Recipe } from '../types';
import { guessUnit } from '../mockData';

interface RecipeModalProps {
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [servings, setServings] = React.useState(1);
  const [prepTime, setPrepTime] = React.useState(10);
  const [cookTime, setCookTime] = React.useState(15);
  const [difficulty, setDifficulty] = React.useState<'fácil' | 'medio' | 'difícil'>('fácil');
  const [ingredientsText, setIngredientsText] = React.useState('');
  const [instructionsText, setInstructionsText] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !ingredientsText.trim()) return;

    // Ingredientes (línea a línea)
    const parsedIngredients = ingredientsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        const qty = parts[1] ? parseFloat(parts[1]) || 1 : 1;
        const unit = parts[2] || guessUnit(name);
        return { name, quantity: qty, unit };
      });

    // Pasos e instrucciones detalladas (línea a línea)
    const parsedSteps = instructionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const defaultSteps = [
      'Preparar y picar los ingredientes necesarios.',
      'Cocinar en sartén o fuego según corresponda.',
      'Emplatar y servir caliente.'
    ];

    const newRecipe: Recipe = {
      id: 'rec_' + Date.now(),
      title: title.trim(),
      description: desc.trim() || 'Receta propia añadida por ti.',
      servings: Number(servings) || 1,
      cookingTimeMinutes: Number(cookTime) || 15,
      prepTimeMinutes: Number(prepTime) || 10,
      difficulty,
      ingredients: parsedIngredients,
      steps: parsedSteps.length > 0 ? parsedSteps : defaultSteps,
    };

    onSave(newRecipe);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-5 w-full max-w-lg max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-500" /> Nueva Receta con Pasos y Tiempos
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre del plato</label>
            <input
              type="text"
              placeholder="Ej: Macarrones con queso y bacon"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Descripción breve</label>
            <input
              type="text"
              placeholder="Ej: Comida rica y rápida para cenar tras las clases"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Tiempos, raciones y dificultad */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Raciones</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={e => setServings(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-center font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Prep (min)</label>
              <input
                type="number"
                value={prepTime}
                onChange={e => setPrepTime(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-center"
                title="Tiempo de preparación previa"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Cocción (min)</label>
              <input
                type="number"
                value={cookTime}
                onChange={e => setCookTime(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-center font-bold text-amber-700"
                title="Tiempo en fuego/horno"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Dificultad</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="fácil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="difícil">Difícil</option>
              </select>
            </div>
          </div>

          {/* Ingredientes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Ingredientes necesarios (<span className="font-normal text-slate-400">Nombre, Cantidad, Unidad</span>):
            </label>
            <textarea
              rows={3}
              placeholder={`Pasta, 150, g\nTomate frito, 1, uds\nAtún, 1, uds\nQueso rallado, 40, g`}
              value={ingredientsText}
              onChange={e => setIngredientsText(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          {/* Instrucciones y Pasos con tiempos */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1">
                <ListOrdered className="w-3.5 h-3.5 text-amber-600" />
                Instrucciones y pasos detallados (1 paso por línea):
              </span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                Altamente recomendado
              </span>
            </label>
            <textarea
              rows={4}
              placeholder={`1. Poner a hervir agua con sal en una olla (8 min).\n2. Echar la pasta y cocinar a fuego medio (10 min).\n3. En una sartén templar el tomate y el atún escurrido.\n4. Mezclar la pasta con la salsa y espolvorear queso por encima.`}
              value={instructionsText}
              onChange={e => setInstructionsText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              💡 Puedes indicar los minutos de cada fase para no despistarte mientras cocinas.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1 active:scale-95"
            >
              <ChefHat className="w-4 h-4" />
              <span>Guardar Receta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
