import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface AvatarProps {
  src?: string | null;
  avatarUrl?: string | null;
  fallback?: string;
  name?: string;
  className?: string;
  backgroundColor?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  onClick?: () => void;
}

export function Avatar({ 
  src, 
  avatarUrl,
  fallback, 
  name,
  className, 
  backgroundColor, 
  alt = "Avatar", 
  size,
  onClick 
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const imageSource = avatarUrl || src;

  React.useEffect(() => {
    setImageError(false);
  }, [imageSource]);

  const hasValidImage = imageSource && imageSource.trim().length > 0 && !imageError;
  const initial = fallback || (name ? name.trim().charAt(0) : 'U');

  const sizeClass = 
    size === 'sm' ? 'h-8 w-8 text-xs' :
    size === 'lg' ? 'h-12 w-12 text-base' :
    size === 'xl' ? 'h-16 w-16 text-lg' :
    'h-10 w-10 text-xs';

  return (
    <div
      onClick={onClick}
      style={!hasValidImage && backgroundColor ? { backgroundColor } : undefined}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full items-center justify-center font-bold text-white shadow-xs select-none",
        sizeClass,
        !hasValidImage && !backgroundColor && "bg-gradient-to-tr from-ikm-orange to-amber-500",
        onClick && "cursor-pointer hover:opacity-90 active:scale-95 transition-transform",
        className
      )}
    >
      {hasValidImage ? (
        <img
          src={imageSource}
          alt={alt || name}
          onError={() => setImageError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span className="uppercase font-bold tracking-wider">
          {initial}
        </span>
      )}
    </div>
  );
}
