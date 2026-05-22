import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import Icon from "../components/Icon";
import ThemeToggle from "../components/ThemeToggle";
import { useApp } from "../context/AppContext";
import { getBrandLogo } from "../data/brand";
import {
  SERVICOS,
  PRAZOS,
  DEPOIMENTOS,
  LOCATION,
  NUMEROS,
  WHATSAPP_NUMBER,
} from "../data/constants";

const wppUrl = (msg) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const abrirWpp = (msg) => window.open(wppUrl(msg), "_blank");

/* ═══════════════════════════════════════════════════════════════
   PARTICLE BACKGROUND
   Partículas douradas (dark) ou âmbar escuro (light) que
   reagem ao mouse. Reutilizado em toda a landing page.
   ═══════════════════════════════════════════════════════════════ */
function ParticleBackground({ id }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(null);
  const { theme } = useApp();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;

    let W = parent.offsetWidth || 1200;
    let H = parent.offsetHeight || 700;
    canvas.width = W;
    canvas.height = H;

    const COUNT = Math.min(Math.floor((W * H) / 6000), 140);
    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: Math.random() * 2.2 + 0.6,
      a: Math.random() * 0.65 + 0.25,
    }));

    const CONNECT = 130;
    const REPULSE = 140;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      const isDark = themeRef.current !== "light";
      // ouro rico da logo (bronze-dourado ~#D4A200) — dark e light
      const dotColor = isDark
        ? (a) => `rgba(210,162,8,${a})`
        : (a) => `rgba(148,108,4,${a * 0.65})`;
      const lineColor = isDark
        ? (a) => `rgba(175,128,5,${a})`
        : (a) => `rgba(125,90,3,${a * 0.55})`;

      const { x: mx, y: my } = mouseRef.current;

      pts.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        const dx = p.x - mx,
          dy = p.y - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < REPULSE && d > 0) {
          const f = (REPULSE - d) / REPULSE;
          p.x += (dx / d) * f * 2.2;
          p.y += (dy / d) * f * 2.2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dotColor(p.a);
        ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const ex = p.x - q.x,
            ey = p.y - q.y;
          const ed = Math.sqrt(ex * ex + ey * ey);
          if (ed < CONNECT) {
            const alpha = (1 - ed / CONNECT) * (isDark ? 0.60 : 0.32);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = lineColor(alpha);
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    let animating = true;
    rafRef.current = requestAnimationFrame(tick);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animating) {
          animating = true;
          rafRef.current = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && animating) {
          animating = false;
          cancelAnimationFrame(rafRef.current);
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    const onMove = (e) => {
      const rc = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rc.left, y: e.clientY - rc.top };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    const onResize = () => {
      W = parent.offsetWidth || 1200;
      H = parent.offsetHeight || 700;
      canvas.width = W;
      canvas.height = H;
    };

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []); // eslint-disable-line

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   BEFORE / AFTER SLIDER
   ═══════════════════════════════════════════════════════════════ */
function BeforeAfterSlider({ beforeSrc, afterSrc }) {
  const wrapRef = useRef(null);
  const dragRef = useRef(false);
  const [pos, setPos] = useState(50);

  const pctFrom = useCallback((e) => {
    const rc = wrapRef.current.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rc.left;
    return Math.min(100, Math.max(0, (cx / rc.width) * 100));
  }, []);

  const onMove = useCallback(
    (e) => {
      if (dragRef.current) setPos(pctFrom(e));
    },
    [pctFrom],
  );
  const onUp = useCallback(() => {
    dragRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [onMove, onUp]);

  return (
    <div
      ref={wrapRef}
      onMouseDown={(e) => {
        dragRef.current = true;
        setPos(pctFrom(e));
      }}
      onTouchStart={(e) => {
        dragRef.current = true;
        setPos(pctFrom(e));
      }}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "3/4",
        borderRadius: 22,
        overflow: "hidden",
        cursor: "col-resize",
        userSelect: "none",
        boxShadow: "0 12px 48px rgba(0,0,0,0.55), 0 0 0 1px var(--border)",
      }}
    >
      <img
        src={afterSrc}
        alt="Depois"
        draggable="false"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 ${100 - pos}% 0 0)`,
        }}
      >
        <img
          src={beforeSrc}
          alt="Antes"
          draggable="false"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${pos}%`,
          transform: "translateX(-50%)",
          width: 2,
          background: "var(--gold)",
          boxShadow: "0 0 16px rgba(245,200,66,0.7)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "var(--gold)",
            color: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 18,
            boxShadow:
              "0 0 24px rgba(245,200,66,0.6),0 2px 10px rgba(0,0,0,0.5)",
            border: "3px solid rgba(255,255,255,0.25)",
          }}
        >
          ⇆
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            background: "rgba(10,10,10,0.72)",
            color: "#ff6b6b",
            padding: "5px 12px",
            borderRadius: 99,
            border: "1px solid rgba(255,107,107,0.4)",
            backdropFilter: "blur(4px)",
          }}
        >
          Antes
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            background: "rgba(10,10,10,0.72)",
            color: "var(--gold)",
            padding: "5px 12px",
            borderRadius: 99,
            border: "1px solid var(--gold-border)",
            backdropFilter: "blur(4px)",
          }}
        >
          Depois
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAROUSEL 3D — Three.js CSS3DRenderer
   Tênis Gucci real flutua no centro; depoimentos orbitam em volta.
   ═══════════════════════════════════════════════════════════════ */
