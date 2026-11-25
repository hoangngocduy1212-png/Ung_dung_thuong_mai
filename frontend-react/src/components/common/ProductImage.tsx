import React, { useState } from 'react';
import { Laptop, Smartphone, Tablet, Headphones, Cpu } from 'lucide-react';

interface ProductImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | string[];
  alt?: string;
  className?: string;
  containerClassName?: string;
  category?: string;
}

const CATEGORY_FALLBACK_ICONS: Record<string, React.ReactNode> = {
  phone: <Smartphone className="w-8 h-8 text-neutral-400 stroke-[1.5]" />,
  laptop: <Laptop className="w-8 h-8 text-neutral-400 stroke-[1.5]" />,
  tablet: <Tablet className="w-8 h-8 text-neutral-400 stroke-[1.5]" />,
  audio: <Headphones className="w-8 h-8 text-neutral-400 stroke-[1.5]" />,
  default: <Cpu className="w-8 h-8 text-neutral-400 stroke-[1.5]" />,
};

// Reliable high-availability CDN tech fallback images per category
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  phone: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80',
  laptop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
  tablet: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
  audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
  default: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
};

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt = 'Sản phẩm',
  className = '',
  containerClassName = '',
  category,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  // Normalize source URL: can be string, array of strings, or undefined
  const rawUrl = Array.isArray(src) ? src[0] : (typeof src === 'string' ? src : '');
  const originalUrl = rawUrl?.trim() || '';

  const normCat = (category || '').toLowerCase();
  const catKey = normCat.includes('thoại') || normCat.includes('phone') ? 'phone'
    : normCat.includes('lap') || normCat.includes('máy tính') ? 'laptop'
    : normCat.includes('bảng') || normCat.includes('tablet') ? 'tablet'
    : normCat.includes('thanh') || normCat.includes('loa') || normCat.includes('audio') ? 'audio'
    : 'default';

  const handleError = () => {
    if (!triedFallback) {
      setTriedFallback(true);
    } else {
      setHasError(true);
    }
  };

  if (hasError || (!originalUrl && triedFallback)) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-neutral-100 rounded-lg p-3 text-center select-none ${containerClassName}`}>
        {CATEGORY_FALLBACK_ICONS[catKey] || CATEGORY_FALLBACK_ICONS.default}
        <span className="text-[10px] text-neutral-400 font-mono mt-1 line-clamp-1 max-w-[85%]">{alt}</span>
      </div>
    );
  }

  const currentSrc = triedFallback ? (CATEGORY_FALLBACK_IMAGES[catKey] || CATEGORY_FALLBACK_IMAGES.default) : (originalUrl || CATEGORY_FALLBACK_IMAGES[catKey]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      loading="lazy"
      decoding="async"
      className={className}
      {...rest}
    />
  );
};
