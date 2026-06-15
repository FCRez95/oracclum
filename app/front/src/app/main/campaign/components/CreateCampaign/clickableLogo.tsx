import Image, { StaticImageData } from "next/image";
import React from "react";

interface ClickableLogoProps {
  src: StaticImageData;
  alt: string;
  onClick: () => void;
  onClickS2S?: () => void;
  isComingSoon: boolean;
  hasS2s?: boolean;
}

export const ClickableLogo = ({
  src,
  alt,
  onClick,
  onClickS2S,
  isComingSoon,
  hasS2s,
}: ClickableLogoProps) => {
  return (
    <div
      className={`relative flex items-center justify-center p-small dark:bg-white/80 bg-bg-app/50 rounded-medium border-2 transition-all ${isComingSoon ? "cursor-not-allowed opacity-40" : "border-transparent"
        }`}
    >
      {/* The image itself */}
      <Image
        src={src}
        alt={alt}
        className="h-10 w-auto object-contain pointer-events-none select-none"
      />

      {/* Divider line */}
      {hasS2s && (
        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-px h-full bg-border-muted/40 pointer-events-none" />
      )}

      {/* Hover & click overlays (invisible but interactive) */}
      {!isComingSoon && hasS2s ? (
        <>
          {/* Left half (normal) */}
          <div
            className="absolute left-0 top-0 w-1/2 h-full rounded-l-medium group"
            onClick={onClick}
          >
            {/* Hover border overlay */}
            <div className="absolute inset-0 rounded-l-medium transition-all group-hover:border-border-highlight border-2 border-transparent" />
            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-extra-small hidden group-hover:block bg-bg-overlay-black text-text-on-primary text-xs rounded-lg whitespace-nowrap z-10">
              {alt}
            </span>
          </div>

          {/* Right half (S2S) */}
          <div
            className="absolute right-0 top-0 w-1/2 h-full rounded-r-lg group"
            onClick={onClickS2S}
          >
            <div className="absolute inset-0 rounded-r-lg transition-all group-hover:border-border-highlight border-2 border-transparent" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-extra-small hidden group-hover:block bg-bg-overlay-black text-text-on-primary text-xs rounded-lg whitespace-nowrap z-10">
              {alt} (S2S)
            </span>
          </div>
        </>
      ) : (
        // Normal version (no S2S split)
        !isComingSoon && (
          <div className="absolute inset-0 rounded-lg group" onClick={onClick}>
            <div className="absolute inset-0 rounded-lg transition-all group-hover:border-border-highlight border-2 border-transparent" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-extra-small hidden group-hover:block bg-bg-overlay-black text-text-on-primary text-xs rounded-lg whitespace-nowrap z-10">
              {alt}
            </span>
          </div>
        )
      )}

      {isComingSoon && (
        <span className="absolute bottom-1 right-1 text-xs bg-bg-card px-extra-small rounded">
          Coming Soon
        </span>
      )}
    </div>
  );
};
