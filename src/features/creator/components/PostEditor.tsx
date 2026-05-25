import React, { useState, useRef, useEffect, useMemo } from 'react';
import { creatorService } from '../services/creator.service';
import { Image, X, Send } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface PostEditorProps {
  onPostCreated: () => void;
}

export const PostEditor = ({ onPostCreated }: PostEditorProps) => {
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    const previewUrl = useMemo(() => {
      if (!imageFile) return null;
  
      return URL.createObjectURL(imageFile);
    }, [imageFile]);
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;

    try {
      setIsSubmitting(true);
      await creatorService.createPost(text, imageFile);
      setText('');
      handleRemoveImage();
      onPostCreated();
    } catch (error) {
      console.error('Error al publicar el post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="¿Qué contenido exclusivo vas a compartir hoy? 🍮"
          className="w-full min-h-[100px] border-none resize-none focus:outline-none text-gray-800 placeholder-gray-400 text-base"
          maxLength={1000}
        />

        {previewUrl && (
          <div className="relative mt-2 mb-4 rounded-lg overflow-hidden max-h-60 bg-gray-50 border border-gray-100 flex items-center justify-center">
            <img src={previewUrl} alt="Preview" className="object-cover max-h-60 w-full" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1.5 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 font-medium text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-50"
          >
            <Image className="w-5 h-5 text-purple-500" />
            <span className="hidden sm:inline">Añadir Imagen</span>
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="w-32">
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!text.trim() && !imageFile}
            >
              <Send className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};