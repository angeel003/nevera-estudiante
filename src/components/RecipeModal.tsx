import React from 'react';
import { ChefHat, X } from 'lucide-react';
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
  const [time, setTime] = React.useState(15);
  const [difficulty, setDifficulty] = React.useState<'fácil' | 'medio' | 'difícil'>('fácil');
  const [ingredientsText, setIngredientsText] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !ingredientsText.trim()) return;

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

    const newRecipe: Recipe = {
      id: 'rec_' + Date.now(),
      title: title.trim(),
      description: desc.trim() || 'Receta propia añadida por ti.',
      servings: Number(servings) || 1,
      cookingTimeMinutes: Number(time) || 15,
      difficulty,
      ingredients: parsedIngredients,
      steps: ['Preparar y mezclar los ingredientes según tu gusto.'],
    };

    onSave(newRecipe);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-500" /> Nueva Receta
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
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
              placeholder="Ej: Comida rica y rápida para cenar"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Raciones</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={e => setServings(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tiempo (min)</label>
              <input
                type="number"
                value={time}
                onChange={e => setTime(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Dificultad</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-1.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="fácil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="difícil">Difícil</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Ingredientes (uno por línea: <span className="font-normal text-slate-400">Nombre, Cantidad, Unidad</span>)
            </label>
            <textarea
              rows={4}
              placeholder={`Pasta, 150, g\nTomate frito, 100, g\nQueso, 50, g`}
              value={ingredientsText}
              onChange={e => setIngredientsText(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              💡 Ejemplo: si escribes "Huevos, 2, uds", descontará 2 huevos del frigo al cocinar.
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
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
            >
              Guardar receta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

