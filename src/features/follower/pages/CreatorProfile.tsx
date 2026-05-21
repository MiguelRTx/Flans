import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { followerService } from '../services/follower.service';
import { Heart, HeartOff, Send, Lock, Target, MessageSquare, ArrowLeft, Clock, Sparkles, Shield } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import type { CreatorProfileData, Goal, Post } from '../../../types';

export const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const creatorId = Number(id);
  const [creator, setCreator] = useState<CreatorProfileData | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [hasDonated, setHasDonated] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [donateAmount, setDonateAmount] = useState(1);
  const [donating, setDonating] = useState(false);
  const [donateMessage, setDonateMessage] = useState('');
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      setPostsLoading(true);
      const postsData = await followerService.getCreatorPosts(creatorId);
      setPosts(postsData);
      setHasDonated(true);
    } catch (error: any) {
      if (error.response?.status === 403) { setHasDonated(false); setPosts([]); }
    } finally { setPostsLoading(false); }
  }, [creatorId]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await followerService.getCreatorProfile(creatorId);
      setCreator(profileData.creator);
      setGoals(profileData.goals);
      try {
        const favData = await followerService.getFavorites();
        setIsFavorite(favData.favorites.some((f) => f.user_id === creatorId || f.id === creatorId));
      } catch { /* ignore */ }
      await loadPosts();
    } catch (error) { console.error('Error cargando perfil:', error); }
    finally { setLoading(false); }
  }, [creatorId, loadPosts]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleDonate = async () => {
    if (donateAmount < 1) return;
    try {
      setDonating(true);
      const result = await followerService.donate(creatorId, donateAmount);
      setDonateMessage(result.message);
      setDonateAmount(1);
      await loadProfile();
      setTimeout(() => setDonateMessage(''), 4000);
    } catch (error: any) { setDonateMessage(error.response?.data?.error || 'Error al donar'); }
    finally { setDonating(false); }
  };

  const handleToggleFavorite = async () => {
    try {
      setFavoriteLoading(true);
      if (isFavorite) { await followerService.removeFavorite(creatorId); setIsFavorite(false); }
      else { await followerService.addFavorite(creatorId); setIsFavorite(true); }
    } catch { /* ignore */ }
    finally { setFavoriteLoading(false); }
  };

  const handleComment = async (postId: number) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    try {
      setCommentingPostId(postId);
      await followerService.createComment(postId, text);
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      await loadPosts();
    } catch { /* ignore */ }
    finally { setCommentingPostId(null); }
  };

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('es-BO', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '';

  if (loading || !creator) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-200 border-t-orange-500" />
          <span className="absolute inset-0 flex items-center justify-center text-sm">🍮</span>
        </div>
        <p className="text-sm text-gray-400 animate-pulse">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/creators" className="inline-flex items-center text-sm text-gray-400 hover:text-amber-600 transition-colors font-medium group">
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
        Volver a Creadores
      </Link>

      {/* Profile Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/80 overflow-hidden">
        {/* Banner */}
        <div className="h-52 bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 relative overflow-hidden">
          {creator.banner ? (
            <img src={creator.banner} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <>
              <div className="absolute top-6 right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-4 left-8 w-32 h-16 bg-white/10 rounded-full blur-xl" />
            </>
          )}
          {/* Overlay gradient at bottom for smooth blend */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="relative -mt-14 mb-4 flex items-end justify-between">
            <div className="relative">
              <img
                src={creator.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name || 'C')}&size=128&background=7c3aed&color=fff&bold=true`}
                alt="Profile"
                className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg border-2 border-white flex items-center justify-center shadow-sm">
                <span className="text-xs">🍮</span>
              </div>
            </div>
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${
                isFavorite
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-200/50 hover:shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50'
              }`}
            >
              {isFavorite ? (
                <><Heart className="w-4 h-4 mr-2 fill-current" />Favorito</>
              ) : (
                <><HeartOff className="w-4 h-4 mr-2" />Agregar a Favoritos</>
              )}
            </button>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900">{creator.display_name || creator.username}</h1>
          {creator.bio && <p className="text-gray-500 mt-2 leading-relaxed">{creator.bio}</p>}

          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-100">
              <span className="text-sm">🍮</span>
              <span className="text-sm font-bold text-amber-700">{creator.total_flanes || 0}</span>
              <span className="text-xs text-amber-500">flanes recibidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals */}
      {goals.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg mr-2">
              <Target className="w-4 h-4 text-white" />
            </div>
            Metas de Apoyo
          </h2>
          <div className="space-y-3">
            {goals.map((g) => (
              <div key={g.id} className="bg-gradient-to-r from-violet-50/50 to-purple-50/50 rounded-xl p-4 border border-violet-100/50">
                <h3 className="font-semibold text-gray-800">{g.title}</h3>
                {g.description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{g.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donate Section */}
      <div className="relative bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-2xl p-6 overflow-hidden shadow-lg">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-10 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 blur-xl" />

        <div className="relative z-10">
          <h2 className="text-lg font-extrabold text-white mb-1 flex items-center">
            <span className="text-xl mr-2">🍮</span> Enviar Flanes
          </h2>
          <p className="text-sm text-white/80 mb-4">Cada flan equivale a Bs. 10. ¡Apoya a este creador!</p>

          {donateMessage && (
            <div className="mb-4 p-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl text-sm font-medium">
              {donateMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-inner">
              <button onClick={() => setDonateAmount(p => Math.max(1, p-1))} className="px-3.5 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors font-bold text-lg">−</button>
              <input type="number" min={1} value={donateAmount} onChange={e => setDonateAmount(Math.max(1, Number(e.target.value)))} className="w-16 text-center py-2.5 border-x border-gray-200 outline-none font-bold text-gray-800 bg-transparent" />
              <button onClick={() => setDonateAmount(p => p+1)} className="px-3.5 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors font-bold text-lg">+</button>
            </div>
            <span className="text-sm font-semibold text-white/90">
              = <span className="text-lg font-extrabold text-white">{donateAmount * 10} Bs.</span>
            </span>
            <Button onClick={handleDonate} isLoading={donating} className="!w-auto !bg-white !text-amber-600 hover:!bg-gray-50 !font-bold !shadow-md">
              <Send className="w-4 h-4 mr-2" />Enviar Flanes
            </Button>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-5">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg mr-2">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          Publicaciones
        </h2>

        {!hasDonated ? (
          <div className="relative bg-white/70 backdrop-blur-sm p-12 rounded-2xl border border-white shadow-xl text-center overflow-hidden">
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-gray-200/30 rounded-full blur-2xl" />
            <div className="p-4 bg-gray-100 rounded-2xl inline-block mb-4">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 text-lg font-bold">Contenido bloqueado</p>
            <p className="text-gray-400 text-sm mt-1 flex items-center justify-center">
              <Shield className="w-4 h-4 mr-1" />
              Debes enviar al menos un flan para ver las publicaciones
            </p>
          </div>
        ) : postsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-200 border-t-orange-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm p-10 rounded-2xl border border-white shadow-sm text-center">
            <p className="text-gray-400">Este creador aún no ha publicado nada</p>
          </div>
        ) : posts.map(post => (
          <div key={post.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/80 overflow-hidden hover:shadow-lg transition-all duration-300">
            {post.image && (
              <div className="p-3 pb-0">
                <img src={post.image} className="w-full max-h-[500px] object-cover rounded-xl" alt="Post" />
              </div>
            )}
            <div className="p-5">
              {post.text && <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.text}</p>}
              <p className="text-xs text-gray-300 mt-3 flex items-center">
                <Clock className="w-3 h-3 mr-1" />{fmt(post.created_at)}
              </p>

              {/* Comment Input */}
              <div className="mt-4 pt-4 border-t border-gray-100/80 flex space-x-2">
                <input
                  type="text"
                  value={commentText[post.id] || ''}
                  onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyDown={e => { if(e.key==='Enter') handleComment(post.id); }}
                  placeholder="Escribe un comentario..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 focus:bg-white outline-none transition-all"
                />
                <button
                  onClick={() => handleComment(post.id)}
                  disabled={!commentText[post.id]?.trim() || commentingPostId === post.id}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-sm shadow-orange-200/50"
                >
                  {commentingPostId === post.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <><MessageSquare className="w-4 h-4 mr-1.5" />Comentar</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
