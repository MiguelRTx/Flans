import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { creatorService } from '../services/creator.service';
import { ProfileHeader } from '../components/ProfileHeader';
import { PostEditor } from '../components/PostEditor';
import { FileText, MessageSquare, Clock } from 'lucide-react';
import type { CreatorProfileData, Post } from '../../../types'; 
import { ImageModal } from '../../../components/common/ImageModal';

export const CreatorDashboard = () => {
  const { user } = useAuthStore();
  

  const [creatorData, setCreatorData] = useState<CreatorProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const profileResponse = await creatorService.getById(user.id);
      const postsResponse = await creatorService.getMyPosts();
      
      setCreatorData(profileResponse.creator);
      setPosts(postsResponse);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading || !creatorData) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Preparando tu workspace... 🍮</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProfileHeader creator={creatorData} onUpdate={loadData} />
      {selectedImage && (
        <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center text-gray-700">
            <FileText className="w-5 h-5 mr-2 text-purple-600 " />
            Nueva Publicación
          </h2>
          <PostEditor onPostCreated={loadData} />

          <h2 className="text-xl font-bold flex items-center pt-4 text-gray-700">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Historial de Publicaciones
          </h2>
          
          {posts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
              <p className="text-gray-600">Aún no has publicado nada. ¡Empieza hoy!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {post.image && <img
                  src={post.image}
                  onClick={() => setSelectedImage(post.image!)}
                  className="w-full aspect-video object-contain bg-gray-50" 
                  alt="Post"
                />}
                <div className="p-6">
                  <p className="text-gray-800 whitespace-pre-wrap">{post.text}</p>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-sm text-gray-500">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {post.comments?.length || 0} comentarios
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Ingresos Totales</h3>
            <div className="text-4xl font-bold mb-4">{creatorData.total_flanes || 0} 🍮</div>
            <p className="text-purple-100 text-sm">Sigue publicando contenido increíble para aumentar tus donaciones.</p>
          </div>
        </div>
      </div>
    </div>
  );
};