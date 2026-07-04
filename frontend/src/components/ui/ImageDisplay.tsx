import React, { useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageDisplayProps {
  src: string;
  alt?: string;
  caption?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  src,
  alt = 'Dynamic Image',
  caption,
  width,
  height,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Parse width/height to make sure they have units if they are numbers
  const parseDimension = (dim?: string | number) => {
    if (dim === undefined) return undefined;
    return typeof dim === 'number' ? `${dim}px` : dim;
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className="relative overflow-hidden rounded-xl border border-dark-600 bg-dark-800/30 flex items-center justify-center"
        style={{
          width: parseDimension(width) || '100%',
          height: parseDimension(height) || 'auto',
          minHeight: '140px',
        }}
      >
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900/50">
            <Loader2 className="h-6 w-6 animate-spin text-accent-primary" />
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center gap-2 text-dark-300 p-6">
            <ImageIcon size={32} />
            <span className="text-xs">Failed to load image</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            className={`object-cover w-full h-full rounded-xl transition-all duration-300 ${
              loading ? 'scale-95 blur-sm' : 'scale-100 blur-0'
            }`}
          />
        )}
      </div>
      {caption && !error && (
        <span className="text-xs text-dark-300 text-center">{caption}</span>
      )}
    </div>
  );
};
export default ImageDisplay;
