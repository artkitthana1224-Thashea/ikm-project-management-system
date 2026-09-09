import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface AvatarProps {
  src?: string | null;
  fallback: string;
  className?: string;
  backgroundColor?: string;
  alt?: string;
  onClick?: () => void;
}

export function Avatar({ src, fallback, className, backgroundColor, alt = "Avatar", onClick }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const hasValidImage = src && src.trim().length > 0 && !imageError;

  return (
    <div
      onClick={onClick}
      style={!hasValidImage && backgroundColor ? { backgroundColor } : undefined}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center font-bold text-white shadow-xs select-none",
        !hasValidImage && !backgroundColor && "bg-gradient-to-tr from-ikm-orange to-amber-500",
        onClick && "cursor-pointer hover:opacity-90 active:scale-95 transition-transform",
        className
      )}
    >
      {hasValidImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span className="text-xs uppercase font-bold tracking-wider">
          {fallback || 'U'}
        </span>
      )}
    </div>
  );
}
