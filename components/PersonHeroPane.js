"use client";

import { useEffect, useRef, useState } from "react";

export function PersonHeroPane({ imageSrc, name, roles, bio }) {
  const posterRef = useRef(null);
  const [posterHeight, setPosterHeight] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const onChange = () => setIsDesktop(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const posterElement = posterRef.current;
    if (!posterElement) return;
    const measure = () => {
      const h = Math.round(posterElement.getBoundingClientRect().height);
      if (h > 0) setPosterHeight(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(posterElement);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full items-center sm:items-start">
      <div className="w-[300px] sm:w-[40%] shrink-0">
        <div className="bg-zinc-800 rounded-lg overflow-hidden">
          <img
            ref={posterRef}
            src={imageSrc}
            alt={name}
            className="block w-full h-auto rounded-lg object-contain"
          />
        </div>
      </div>
      <div
        className="flex-1 min-w-0 flex flex-col sm:min-h-0"
        style={isDesktop && posterHeight ? { height: `${posterHeight}px` } : undefined}
      >
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-1">{name}</h1>
        {Array.isArray(roles) && roles.length > 0 ? (
          <p className="mb-4 text-sm text-gray-400 text-center mb-2">{roles.join(" · ")}</p>
        ) : null}
        <div className="max-h-[250px] overflow-y-auto sm:max-h-none sm:flex-1 sm:min-h-0 pr-6 pl-6 sm:pl-0 sm:pr-2">
          {bio ? (
            <p className="text-sm text-gray-300">{bio}</p>
          ) : (
            <p className="text-sm text-gray-500">No biography available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
