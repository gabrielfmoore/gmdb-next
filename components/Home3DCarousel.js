"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

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
    let lastDragX = 0;
    let lastDragTs = 0;
    let dragVelocity = 0;
    let momentumTween = null;

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
        // Equal z-index + DOM order stacks later panels on top in 2D hit-testing,
        // ignoring 3D depth. Tie stacking order to how much each panel faces the camera.
        const facing = Math.cos((rotation * Math.PI) / 180);
        panel.style.zIndex = String(Math.round(100 + 100 * facing));
      });
    };

    const setProgress = (nextProgress) => {
      progress = wrapProgress(nextProgress);
      renderRotation();
    };

    const stopMomentum = () => {
      momentumTween?.kill();
      momentumTween = null;
    };

    applyPanelLayout();
    renderRotation();

    const draggable = Draggable.create(proxy, {
      trigger: wrap,
      type: "x",
      allowNativeTouchScrolling: true,
      onPress() {
        stopMomentum();
        startX = this.x;
        startProgress = progress;
        lastDragX = this.x;
        lastDragTs = performance.now();
        dragVelocity = 0;
      },
      onDrag() {
        const now = performance.now();
        const elapsed = Math.max(16, now - lastDragTs);
        const moved = this.x - lastDragX;
        dragVelocity = moved / elapsed;
        lastDragX = this.x;
        lastDragTs = now;

        const delta = (startX - this.x) / dragDistance;
        setProgress(startProgress + delta);
      },
      onRelease() {
        const minVelocity = 0.0055;
        if (Math.abs(dragVelocity) < minVelocity) return;

        const state = { velocity: dragVelocity };
        momentumTween = gsap.to(state, {
          velocity: 0,
          duration: 1.8,
          ease: "power2.out",
          onUpdate() {
            const frameStep = (state.velocity * 24) / dragDistance;
            setProgress(progress - frameStep);
          },
          onComplete() {
            momentumTween = null;
          },
        });
      },
    })[0];

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
      sizeObserver.disconnect();
      stopMomentum();
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
            className={`img-carousel__panel${index % 2 === 0 ? " is-lower" : ""}`}
          >
            <div data-3d-carousel-content className="img-carousel__item">
              <Link
                href={`/movie/${item.id}`}
                className="img-carousel__link"
                data-clickable="true"
                draggable={false}
              >
                <img src={item.poster} alt={item.title} className="img-carousel__img" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
