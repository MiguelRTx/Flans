import { useEffect, useState } from 'react';
import { followerService } from '../services/follower.service';
import { Heart, Trash2, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CreatorListItem } from '../../../types';

export const FollowerFavorites = () => {
  const [favorites, setFavorites] = useState<CreatorListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await followerService.getFavorites();
      setFavorites(data.favorites);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFavorites(); }, []);

  const handleRemove = async (creatorId: number) => {
    try {
      await followerService.removeFavorite(creatorId);
      loadFavorites();
    } catch (error) {
      console.error('Error eliminando favorito:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-200 border-t-rose-500" />
          <span className="absolute inset-0 flex items-center justify-center text-sm">❤️</span>
        </div>
        <p className="text-sm text-gray-400 animate-pulse">Cargando favoritos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl shadow-md shadow-rose-200/50">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Mis Favoritos</h1>
            <p className="text-sm text-gray-600">{favorites.length} {favorites.length === 1 ? 'creador guardado' : 'creadores guardados'}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-1 text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium">{favorites.length} favoritos</span>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="relative bg-white/70 backdrop-blur-sm p-14 rounded-3xl border border-white shadow-xl text-center overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-200/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="inline-block p-4 bg-rose-50 rounded-2xl mb-4">
              <Heart className="w-10 h-10 text-rose-300" />
            </div>
            <p className="text-gray-700 text-xl font-bold">No tienes favoritos aún</p>
            <p className="text-gray-600 text-sm mt-2">Explora creadores y márcalos como favoritos</p>
            <Link
              to="/creators"
              className="inline-flex items-center mt-6 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all shadow-md shadow-violet-200/50 text-sm font-semibold"
            >
              <Users className="w-4 h-4 mr-2" />
              Explorar Creadores
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav, index) => (
            <div
              key={fav.id || fav.user_id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center p-4">
                <Link to={`/creators/${fav.user_id || fav.id}`} className="flex items-center flex-1 min-w-0">
                  <div className="relative">
                    <img
                      src={fav.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(fav.display_name || fav.username || 'C')}&background=e11d48&color=fff&bold=true`}
                      alt={fav.display_name || fav.username || 'Creador'}
                      className="w-13 h-13 rounded-xl object-cover ring-2 ring-rose-100 group-hover:ring-rose-300 transition-all"
                      style={{ width: '52px', height: '52px' }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-rose-400 to-pink-400 rounded-md border-2 border-white flex items-center justify-center">
                      <Heart className="w-2.5 h-2.5 text-white fill-current" />
                    </div>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors truncate">
                      {fav.display_name || fav.username || 'Creador'}
                    </h3>
                    {fav.bio && <p className="text-sm text-gray-400 truncate mt-0.5">{fav.bio}</p>}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                </Link>
                <button
                  onClick={() => handleRemove(fav.user_id || fav.id)}
                  className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-3"
                  title="Quitar de favoritos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
