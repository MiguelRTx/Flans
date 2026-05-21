import { useEffect, useState } from 'react';
import { creatorService } from '../services/creator.service';
import { PostEditor } from '../components/PostEditor';
import { FileText, MessageSquare, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { Post } from '../../../types';

export const CreatorPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await creatorService.getMyPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error cargando posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;
    try {
      await creatorService.deletePost(id);
      loadPosts();
    } catch (error) {
      console.error('Error eliminando post:', error);
    }
  };

  const toggleComments = (postId: number) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <FileText className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Publicaciones</h1>
          <p className="text-sm text-gray-500">
            {posts.length} {posts.length === 1 ? 'publicación' : 'publicaciones'}
          </p>
        </div>
      </div>

      {/* Post Editor */}
      <PostEditor onPostCreated={loadPosts} />

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No tienes publicaciones aún</p>
          <p className="text-gray-400 text-sm mt-1">¡Crea tu primera publicación arriba!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const commentCount = post.comments?.length || 0;
            const isExpanded = expandedComments.has(post.id);

            return (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {post.image && (
                  <div className="bg-gray-50 border-b border-gray-100">
                    <img
                      src={post.image}
                      className="w-full aspect-video object-contain"
                      alt="Post"
                    />
                  </div>
                )}
                <div className="p-6">
                  {post.text && (
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {post.text}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(post.created_at)}
                      </span>
                      {commentCount > 0 && (
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {commentCount} {commentCount === 1 ? 'comentario' : 'comentarios'}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 ml-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      )}
                      {commentCount === 0 && (
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Sin comentarios
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar publicación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {isExpanded && commentCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1 text-purple-500" />
                        Comentarios (Solo visibles para ti)
                      </h4>
                      {post.comments!.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.follower_username || `Seguidor #${comment.follower_id}`}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
