"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Draggable, Observer);

export function Home3DCarousel({ items }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const panels = wrap.querySelectorAll("[data-3d-carousel-panel]");
    if (!panels.length) return;

    let progress = 0;
    let radius = 0;
    const wrapProgress = gsap.utils.wrap(0, 1);

    const proxy = document.createElement("div");
    let dragDistance = 0;
    let startX = 0;
    let startProgress = 0;

    let panelWidthPx = 140;
    let panelHeightPx = 420;

    const applyPanelLayout = () => {
      const wrapWidth = wrap.clientWidth || window.innerWidth;
      radius = wrapWidth * 0.5;
      dragDistance = wrapWidth * 3;
      panelWidthPx = Math.max(140, Math.min(304, wrapWidth * 0.224));
      panelHeightPx = panelWidthPx * 3; // 2 x (2:3) poster cards stacked

      gsap.set(wrap, {
        perspective: `${Math.round(wrapWidth * 1.1)}px`,
        height: `${Math.round(panelHeightPx * 1.1)}px`,
      });

      panels.forEach((panel, index) => {
        gsap.set(panel, {
          width: panelWidthPx,
          height: panelHeightPx,
        });
        panel.style.transformOrigin = `50% 50% ${-radius}px`;
      });
    };

    const renderRotation = () => {
      panels.forEach((panel, index) => {
        const rotation = index * (360 / panels.length) - progress * 360;
        gsap.set(panel, { rotationY: rotation });
      });
    };

    const setProgress = (nextProgress) => {
      progress = wrapProgress(nextProgress);
      renderRotation();
    };

    applyPanelLayout();
    renderRotation();

    const draggable = Draggable.create(proxy, {
      trigger: wrap,
      type: "x",
      allowNativeTouchScrolling: true,
      onPress() {
        startX = this.x;
        startProgress = progress;
      },
      onDrag() {
        const delta = (startX - this.x) / dragDistance;
        setProgress(startProgress + delta);
      },
    })[0];

    const observer = Observer.create({
      target: wrap,
      type: "wheel,touch",
      onChangeY: (self) => {
        setProgress(progress + self.deltaY * 0.00035);
      },
    });

    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        applyPanelLayout();
        renderRotation();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    const sizeObserver = new ResizeObserver(() => {
      applyPanelLayout();
      renderRotation();
    });
    sizeObserver.observe(wrap);

    return () => {
      draggable?.kill();
      observer?.kill();
      sizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, [items.length]);

  return (
    <div className="img-carousel__wrap mx-[7vw]">
      <div ref={wrapRef} data-3d-carousel-wrap className="img-carousel__list">
        {items.map((item, index) => (
          <div
            key={item.id}
            data-3d-carousel-panel
            className={`img-carousel__panel${index % 2 === 1 ? " is-even" : ""}`}
          >
            <div data-3d-carousel-content className="img-carousel__item">
              <img src={item.poster} alt={item.title} className="img-carousel__img" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
