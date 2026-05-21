import { useEffect, useState } from 'react';
import { followerService } from '../services/follower.service';
import { Search, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CreatorListItem } from '../../../types';

export const CreatorsList = () => {
  const [creators, setCreators] = useState<CreatorListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CreatorListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const loadCreators = async () => {
      try {
        const data = await followerService.getAllCreators();
        setCreators(data.creators);
      } catch (error) {
        console.error('Error cargando creadores:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCreators();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      setSearching(true);
      const data = await followerService.searchCreators(searchQuery.trim());
      setSearchResults(data.creators);
    } catch (error) {
      console.error('Error buscando creadores:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const displayedCreators = searchResults !== null ? searchResults : creators;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-200 border-t-orange-500" />
          <span className="absolute inset-0 flex items-center justify-center text-sm">🍮</span>
        </div>
        <p className="text-sm text-gray-400 animate-pulse">Cargando creadores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-md shadow-purple-200/50">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Creadores</h1>
            <p className="text-sm text-gray-500">Descubre y apoya a creadores increíbles</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-1 text-xs text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium">{displayedCreators.length} creadores</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/80 p-5 shadow-sm">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar creadores por nombre..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 focus:bg-white outline-none transition-all text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-semibold text-sm disabled:opacity-70 shadow-md shadow-violet-200/50"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
          {searchResults !== null && (
            <button
              onClick={clearSearch}
              className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium"
            >
              Limpiar
            </button>
          )}
        </div>
        {searchResults !== null && (
          <p className="text-sm text-gray-400 mt-3 pl-1">
            {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'} para "<span className="text-violet-600 font-medium">{searchQuery}</span>"
          </p>
        )}
      </div>

      {/* Creators Grid */}
      {displayedCreators.length === 0 ? (
        <div className="relative bg-white/70 backdrop-blur-sm p-14 rounded-3xl border border-white shadow-xl text-center overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-200/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl" />
          <Users className="w-14 h-14 text-violet-200 mx-auto mb-4" />
          <p className="text-gray-700 text-xl font-bold relative z-10">
            {searchResults !== null ? 'No se encontraron creadores' : 'No hay creadores registrados aún'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {displayedCreators.map((creator, index) => (
            <Link
              key={creator.id || creator.user_id}
              to={`/creators/${creator.user_id || creator.id}`}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Mini Banner */}
              <div className="h-24 bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 relative overflow-hidden">
                {creator.banner ? (
                  <img
                    src={creator.banner}
                    alt="Banner"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-2 right-4 w-16 h-16 bg-white/20 rounded-full blur-xl" />
                    <div className="absolute bottom-0 left-4 w-20 h-10 bg-white/10 rounded-full blur-lg" />
                  </div>
                )}
              </div>
              <div className="p-5 -mt-7 relative">
                <img
                  src={
                    creator.profile_photo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name || creator.username || 'C')}&background=7c3aed&color=fff&bold=true`
                  }
                  alt={creator.display_name || creator.username || 'Creador'}
                  className="w-14 h-14 rounded-xl border-3 border-white shadow-lg object-cover ring-2 ring-white"
                />
                <div className="mt-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-violet-600 transition-colors truncate">
                      {creator.display_name || creator.username || 'Creador'}
                    </h3>
                    {creator.bio && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">{creator.bio}</p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
