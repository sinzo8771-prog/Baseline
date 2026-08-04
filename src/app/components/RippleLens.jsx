// React wrapper around canvas-ui's Ripple water effect.
// Same source/content/output architecture as GlassLens (HTML-in-canvas), with
// a WebGL overlay fallback when the API is unavailable. Self-respects
// prefers-reduced-motion.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  createRipple,
  supportsHtmlInCanvas,
} from "../../components/canvasui/RippleVanilla.ts";

const emptySubscribe = () => () => {};

export default function RippleLens({
  children,
  className = "",
  style,
  amplitude = 0.4,
  speed = 0.6,
  wavelength = 90,
  rings = 2,
  decay = 1.1,
  refraction = 60,
  dispersion = 0.4,
  shine = 0.4,
  trigger = "click",
  interval = 0,
}) {
  const sourceRef = useRef(null);
  const contentRef = useRef(null);
  const outputRef = useRef(null);
  const instanceRef = useRef(null);
  const [failed, setFailed] = useState(false);

  const supported = useSyncExternalStore(
    emptySubscribe,
    supportsHtmlInCanvas,
    () => false,
  );
  const native = supported && !failed;

  useEffect(() => {
    const source = sourceRef.current;
    const content = contentRef.current;
    const output = outputRef.current;
    if (!source || !content || !output) return undefined;
    instanceRef.current = createRipple(
      { source, content, output },
      { amplitude, speed, wavelength, rings, decay, refraction, dispersion, shine, trigger, interval },
    );
    if (native && !instanceRef.current) setFailed(true);
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [amplitude, speed, wavelength, rings, decay, refraction, dispersion, shine, trigger, interval, native]);

  useEffect(() => {
    instanceRef.current?.setOptions({ amplitude, speed, wavelength, rings, decay, refraction, dispersion, shine, trigger, interval });
  });

  return (
    <div
      className={className || "ripple-lens"}
      style={{ position: "relative", ...style }}
    >
      <canvas
        ref={sourceRef}
        layoutsubtree="true"
        aria-hidden="true"
        style={
          native
            ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
            : { display: "none" }
        }
      >
        {native ? (
          <div
            ref={contentRef}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "auto",
            }}
          >
            {children}
          </div>
        ) : null}
      </canvas>
      {!native ? (
        <div
          ref={contentRef}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
        >
          {children}
        </div>
      ) : null}
      <canvas
        ref={outputRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export { supportsHtmlInCanvas };