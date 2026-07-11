"use client";

import { useState, useCallback } from "react";

interface Props {
  slug: string;
  gradient: string;
  className?: string;
  children?: React.ReactNode;
  fallbackIcon?: React.ReactNode;
}

export function GameCover({ slug, gradient, className = "", children, fallbackIcon }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const basePath = process.env.__NEXT_ROUTER_BASEPATH || "/boardgames";
  const src = imgFailed ? "" : `${basePath}/images/games/${slug}.webp`;

  const handleError = useCallback(() => {
    setImgFailed(true);
  }, []);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      {!imgFailed && (
        <img
          src={src}
          alt=""
          onLoad={() => setImgLoaded(true)}
          onError={handleError}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          draggable={false}
        />
      )}
      {!imgLoaded && (
        fallbackIcon ? (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            {fallbackIcon}
          </div>
        ) : (
          <div className="absolute inset-0 opacity-20" aria-hidden="true">
            <div className="absolute -top-6 -right-6 h-40 w-40 rounded-full bg-white/40" />
            <div className="absolute top-1/3 -left-4 h-28 w-28 rounded-full bg-white/25" />
            <div className="absolute bottom-1/4 right-8 h-6 w-6 rounded-full bg-white/50" />
          </div>
        )
      )}
      {children}
    </div>
  );
}
