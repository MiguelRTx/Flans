import React, { useState, useRef} from 'react';
import { Camera, Edit2} from 'lucide-react';
import { creatorService } from '../services/creator.service';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import type { CreatorProfileData } from '../../../types';

interface ProfileHeaderProps {
  creator: CreatorProfileData;
  onUpdate: () => void;
}

export const ProfileHeader = ({ creator, onUpdate }: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(creator.display_name || '');
  const [bio, setBio] = useState(creator.bio || '');
  const [isLoading, setIsLoading] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleTextUpdate = async () => {
    try {
      setIsLoading(true);
      await creatorService.updateProfile({ display_name: displayName, bio });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      if (type === 'photo') await creatorService.uploadPhoto(file);
      else await creatorService.uploadBanner(file);
      onUpdate();
    } catch (error) {
      console.error(`Error al subir ${type}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="relative h-48 md:h-64 bg-gray-200">
        <img 
          src={creator.banner || 'https://images.unsplash.com/photo-1557683316-973673baf926'} 
          className="w-full h-full object-cover" 
          alt="Banner" 
        />
        <button 
          onClick={() => bannerInputRef.current?.click()}
          className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm"
        >
          <Camera className="w-5 h-5" />
        </button>
        <input type="file" ref={bannerInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'banner')} accept="image/*" />
      </div>

      <div className="px-8 pb-8">
        <div className="relative -mt-16 mb-4">
          <div className="inline-block relative">
            <img 
              src={creator.profile_photo || 'https://via.placeholder.com/150'} 
              className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-gray-50" 
              alt="Profile" 
            />
            <button 
              onClick={() => photoInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full border-2 border-white transition-all"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input type="file" ref={photoInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'photo')} accept="image/*" />
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1 max-w-2xl">
            {isEditing ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <Input label="Nombre Público" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">Biografía</label>
                  <textarea 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none h-24 resize-none"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button onClick={handleTextUpdate} isLoading={isLoading} className="w-32">Guardar</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="w-32">Cancelar</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-gray-900">{creator.display_name || creator.username}</h1>
                  <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mt-2 text-lg leading-relaxed">{creator.bio || "Aún no tienes una biografía. ¡Cuéntale a tus seguidores quién eres!"}</p>
                <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center"><span className="font-bold text-gray-900 mr-1">{creator.total_flanes || 0}</span> Flanes recibidos</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};