import { useEffect, useState } from 'react';
import { followerService } from '../services/follower.service';
import { Home, MessageSquare, Clock, Sparkles } from 'lucide-react';
import type { FeedPost } from '../../../types';
import { Link } from 'react-router-dom';
import { ImageModal } from '../../../components/common/ImageModal';

export const FollowerFeed = () => {
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  useEffect(() => {
    const loadFeed = async () => {
      try {
        const data = await followerService.getFeed();
        setFeed(data.feed);
      } catch (error) {
        console.error('Error cargando feed:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-200 border-t-orange-500" />
          <span className="absolute inset-0 flex items-center justify-center text-sm">🍮</span>
        </div>
        <p className="text-sm text-gray-400 animate-pulse">Cargando tu feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/80 p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md shadow-orange-200/50">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Para ti</h1>
            <p className="text-sm text-gray-600 font-medium">Publicaciones de los creadores que apoyas</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium">{feed.length} publicaciones</span>
        </div>
      </div>
      {selectedImage && (
        <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
      {feed.length === 0 ? (
        <div className="relative bg-white/70 backdrop-blur-sm p-14 rounded-3xl border border-white shadow-xl text-center overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-200/30 rounded-full blur-2xl" />
          <span className="text-6xl block mb-4 drop-shadow-sm">🍮</span>
          <p className="text-gray-700 text-xl font-bold relative z-10">Tu feed está vacío</p>
          <p className="text-gray-400 text-sm mt-2 relative z-10">
            Envía flanes a creadores para desbloquear sus publicaciones
          </p>
          <Link
            to="/creators"
            className="relative z-10 inline-flex items-center mt-6 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-200/50 text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Explorar Creadores
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {feed.map((post, index) => (
            <div
              key={post.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/80 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center space-x-3 p-5 pb-3">
                <Link to={`/creators/${post.creator_id}`} className="relative group">
                  <img
                    src={post.creator_photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.creator_display_name|| 'C') + '&background=f59e0b&color=fff'}
                    alt={post.creator_display_name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-100 group-hover:ring-amber-400 transition-all"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-[8px]">🍮</span>
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/creators/${post.creator_id}`}
                    className="text-sm font-bold text-gray-900 hover:text-amber-600 transition-colors"
                  >
                    {post.creator_display_name}
                  </Link>
                  <p className="text-xs text-gray-400 flex items-center mt-0.5">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(post.created_at)}
                  </p>
                </div>
              </div>
              {post.text && (
                <div className="px-5 pb-3">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.text}</p>
                </div>
              )}

              {post.image && (
                <div className="px-3 pb-3">
                  <img
                    src={post.image}
                    onClick={() => setSelectedImage(post.image!)}
                    className="w-full max-h-[500px] object-cover rounded-xl"
                    alt="Post"
                  />
                </div>
              )}
              <div className="px-5 py-3 border-t border-gray-50 flex items-center">
                <Link
                  to={`/creators/${post.creator_id}`}
                  className="flex items-center px-3 py-1.5 text-sm text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all font-medium"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Comentar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    
  );
  
};
