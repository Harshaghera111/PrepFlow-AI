// TiltCard — lightweight 3D hover effect (no extra libs)
import React, { useEffect, useRef, useState } from "react";

function TiltCard({
  children,
  className = "",
  strength = 10,
  disabled = false,
}) {
  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(!!mq.matches);
    update();
    // Safari/old browsers: addListener/removeListener fallback
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    el.style.boxShadow = "";
  };

  const onMouseMove = (e) => {
    if (disabled || isMobile) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1

    const ry = (px - 0.5) * 2 * strength;
    const rx = (0.5 - py) * 2 * strength;

    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    el.style.boxShadow = "0 18px 45px rgba(0,0,0,0.55)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={reset}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

export default TiltCard;

