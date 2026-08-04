// React wrapper around canvas-ui's Glass lens.
//
// Canvas UI captures the live DOM into a "source" canvas (the experimental
// HTML-in-canvas / layoutsubtree API) and draws the WebGL effect onto an
// "output" canvas that overlays the page. When the API is unavailable the
// effect falls back to rendering the children normally (WebGL overlay fallback),
// so content is never hidden. The effect self-respects prefers-reduced-motion.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  createGlass,
  supportsHtmlInCanvas,
} from "../../components/canvasui/GlassVanilla.ts";

const emptySubscribe = () => () => {};

export default function GlassLens({
  children,
  className = "",
  style,
  shape = "circle",
  size = 220,
  aspect = 1.7,
  corner = 32,
  ior = 1.5,
  edge = 0.7,
  bevel = 4,
  depth = 260,
  aberration = 1.1,
  blur = 0.15,
  reflection = 1,
  shine = 0.4,
  zoom = 1.4,
  follow = 0.25,
  targets = "h1, h2, h3, a, button",
}) {
  const sourceRef = useRef(null);
  const contentRef = useRef(null);
  const outputRef = useRef(null);
  const instanceRef = useRef(null);
  const [initialOptions] = useState({});
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
    instanceRef.current = createGlass(
      { source, content, output },
      { shape, size, aspect, corner, ior, edge, bevel, depth, aberration, blur, reflection, shine, zoom, follow, targets },
    );
    if (native && !instanceRef.current) setFailed(true);
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [
    shape, size, aspect, corner, ior, edge, bevel, depth, aberration,
    blur, reflection, shine, zoom, follow, targets, native,
  ]);

  useEffect(() => {
    instanceRef.current?.setOptions({ shape, size, aspect, corner, ior, edge, bevel, depth, aberration, blur, reflection, shine, zoom, follow, targets });
  });

  return (
    <div
      className={className || "glass-lens"}
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