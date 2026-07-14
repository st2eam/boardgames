"use client";

import { useState, useEffect } from "react";

interface Props {
  slug: string;
  gradient: string;
  className?: string;
  children?: React.ReactNode;
  fallbackIcon?: React.ReactNode;
}

const basePath = process.env.__NEXT_ROUTER_BASEPATH || "/boardgames";

let cachedManifest: Record<string, string> | null = null;
let fetchPromise: Promise<Record<string, string>> | null = null;

function fetchManifest(): Promise<Record<string, string>> {
  if (cachedManifest) return Promise.resolve(cachedManifest);
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch(`${basePath}/data/cover-manifest.json`, { cache: "no-store" })
    .then(r => r.json())
    .then(m => {
      cachedManifest = m;
      return m;
    })
    .catch(() => ({}));
  return fetchPromise;
}

export function GameCover({ slug, gradient, className = "", children, fallbackIcon }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [ext, setExt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchManifest().then(m => {
      setExt(m[slug] ?? null);
      setLoaded(true);
    });
  }, [slug]);

  // Still loading manifest — show fallback, no 404
  if (!loaded) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
        <GradientFallback fallbackIcon={fallbackIcon} />
        {children}
      </div>
    );
  }

  const hasCover = ext !== null;
  const src = hasCover ? `${basePath}/images/games/${slug}.${ext}` : "";

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      {hasCover && (
        <img
          src={src}
          alt=""
          onLoad={() => setImgLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-out group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          draggable={false}
        />
      )}
      {!imgLoaded && <GradientFallback fallbackIcon={fallbackIcon} />}
      {children}
    </div>
  );
}

function GradientFallback({ fallbackIcon }: { fallbackIcon?: React.ReactNode }) {
  if (fallbackIcon) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        {fallbackIcon}
      </div>
    );
  }
  return (
    <div className="absolute inset-0 opacity-20" aria-hidden="true">
      <div className="absolute -top-6 -right-6 h-40 w-40 rounded-full bg-white/40" />
      <div className="absolute top-1/3 -left-4 h-28 w-28 rounded-full bg-white/25" />
      <div className="absolute bottom-1/4 right-8 h-6 w-6 rounded-full bg-white/50" />
    </div>
  );
}
