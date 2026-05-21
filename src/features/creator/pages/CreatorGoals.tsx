import { useEffect, useState } from 'react';
import { creatorService } from '../services/creator.service';
import { Target, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import type { Goal } from '../../../types';

export const CreatorGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await creatorService.getMyGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error cargando metas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setShowForm(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      setSubmitting(true);
      await creatorService.createGoal({ title: title.trim(), description: description.trim() });
      resetForm();
      loadGoals();
    } catch (error) {
      console.error('Error creando meta:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !title.trim()) return;
    try {
      setSubmitting(true);
      await creatorService.updateGoal(editingId, { title: title.trim(), description: description.trim() });
      resetForm();
      loadGoals();
    } catch (error) {
      console.error('Error actualizando meta:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta meta?')) return;
    try {
      await creatorService.deleteGoal(id);
      loadGoals();
    } catch (error) {
      console.error('Error eliminando meta:', error);
    }
  };

  const startEditing = (goal: Goal) => {
    setEditingId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Metas de Apoyo</h1>
            <p className="text-sm text-gray-500">Incentiva a tus seguidores con metas claras</p>
          </div>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="!w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Meta
          </Button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Meta' : 'Crear Nueva Meta'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: ¡Alcanzar 100 flanes!"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe qué harás al alcanzar esta meta..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none resize-none transition-colors"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={editingId ? handleUpdate : handleCreate}
                isLoading={submitting}
                disabled={!title.trim()}
                className="!w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Actualizar' : 'Crear Meta'}
              </Button>
              <Button variant="outline" onClick={resetForm} className="!w-auto">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No tienes metas aún</p>
          <p className="text-gray-400 text-sm mt-1">Crea metas para motivar a tus seguidores a apoyarte</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  </div>
                  {goal.description && (
                    <p className="text-gray-600 leading-relaxed">{goal.description}</p>
                  )}
                </div>
                <div className="flex space-x-1 ml-4">
                  <button
                    onClick={() => startEditing(goal)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
