import type { ImageModalProps } from "../../types";


export const ImageModal = ({ src, onClose }: ImageModalProps) => {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <button 
        className="absolute top-5 right-5 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"
        onClick={onClose}
      >
        ✕
      </button>
      <img 
        src={src} 
        alt="Full view" 
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};