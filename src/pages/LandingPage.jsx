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
const ORBIT_RADIUS_X = 500;
const ORBIT_RADIUS_Z = 140;
const AUTO_SPEED = 0.0035;
const EASE_F = 0.058;
const Y_AMP = 10;
function lerpF(a, b, t) {
  return a + (b - a) * t;
}

function buildCardEl(d) {
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    width: "300px",
    height: "200px",
    borderRadius: "16px",
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    boxSizing: "border-box",
    cursor: "pointer",
    userSelect: "none",
    transition: "border-color .28s,box-shadow .28s,background .28s,transform .18s",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-card)",
    willChange: "transform",
    backfaceVisibility: "hidden",
    touchAction: "none",
    fontFamily: "var(--font-body)",
  });
  const stars = document.createElement("div");
  stars.style.cssText = "display:flex;gap:2px;flex-shrink:0;";
  stars.innerHTML = Array.from({ length: d.nota })
    .map(() => `<span style="color:var(--gold);font-size:14px;line-height:1;">★</span>`)
    .join("");
  const txt = document.createElement("p");
  Object.assign(txt.style, {
    fontSize: "12.5px",
    color: "var(--text-muted)",
    lineHeight: "1.55",
    flex: "1",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: "3",
    WebkitBoxOrient: "vertical",
    margin: "0",
  });
  txt.textContent = `"${d.texto}"`;
  const badge = document.createElement("span");
  Object.assign(badge.style, {
    alignSelf: "flex-start",
    fontSize: "9.5px",
    fontWeight: "900",
    color: "var(--gold)",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    background: "var(--gold-dim)",
    border: "1px solid var(--gold-border)",
    borderRadius: "99px",
    padding: "3px 9px",
    flexShrink: "0",
  });
  badge.textContent = d.servico;
  const author = document.createElement("div");
  Object.assign(author.style, {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginTop: "auto",
    flexShrink: "0",
  });
  const avatar = document.createElement("div");
  Object.assign(avatar.style, {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "var(--gold-dim)",
    border: "1px solid var(--gold-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
    fontSize: "13px",
    fontWeight: "900",
    color: "var(--gold)",
  });
  avatar.textContent = d.inicial;
  const info = document.createElement("div");
  info.style.minWidth = "0";
  const nome = document.createElement("p");
  Object.assign(nome.style, {
    fontSize: "13px",
    fontWeight: "900",
    color: "var(--text)",
    margin: "0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  });
  nome.textContent = d.nome;
  const cidade = document.createElement("p");
  Object.assign(cidade.style, {
    fontSize: "11px",
    color: "var(--text-dim)",
    margin: "2px 0 0",
  });
  cidade.textContent = d.cidade;
  info.appendChild(nome);
  info.appendChild(cidade);
  author.appendChild(avatar);
  author.appendChild(info);
  wrap.appendChild(stars);
  wrap.appendChild(txt);
  wrap.appendChild(badge);
  wrap.appendChild(author);
  return wrap;
}

function Carousel3D() {
  const containerRef = useRef(null);
  const sneakerRef = useRef(null);
  const rendererRef = useRef(null);
  const rafRef = useRef(null);
  const angleRef = useRef(0);
  const targetAngle = useRef(0);
  const pausedRef = useRef(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragBase = useRef(0);
  const hoveredRef = useRef(null);
  const clockRef = useRef(0);
  const objectsRef = useRef([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const total = DEPOIMENTOS.length;
  const STEP = (Math.PI * 2) / total;

  const snapTo = useCallback(
    (idx) => {
      const r = Math.round(targetAngle.current / (Math.PI * 2));
      targetAngle.current = r * Math.PI * 2 - idx * STEP;
      setActiveIdx(idx);
    },
    [STEP],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const W = el.clientWidth || 900;
    const H = el.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, W / H, 1, 6000);
    camera.position.set(0, 0, 720);
    camera.lookAt(0, 0, 0);

    const renderer = new CSS3DRenderer();
    renderer.setSize(W, H);

    Object.assign(renderer.domElement.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      zIndex: 3,
    });
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const objects = [];
    DEPOIMENTOS.forEach((d, i) => {
      const cardEl = buildCardEl(d);
      const obj = new CSS3DObject(cardEl);
      const angle = i * STEP;
      obj.position.set(
        Math.sin(angle) * ORBIT_RADIUS_X,
        0,
        Math.cos(angle) * ORBIT_RADIUS_Z,
      );
      obj.rotation.y = angle;
      obj.userData = { cardEl };
      scene.add(obj);
      objects.push(obj);
      cardEl.addEventListener("mouseenter", () => {
        hoveredRef.current = i;
        pausedRef.current = true;
      });
      cardEl.addEventListener("mouseleave", () => {
        if (hoveredRef.current === i) hoveredRef.current = null;
        pausedRef.current = false;
      });
      cardEl.addEventListener("click", () => snapTo(i));
    });
    objectsRef.current = objects;

    const tick = (ts) => {
      rafRef.current = requestAnimationFrame(tick);
      clockRef.current = ts * 0.001;
      if (!pausedRef.current && !dragging.current)
        targetAngle.current += AUTO_SPEED;
      angleRef.current = lerpF(angleRef.current, targetAngle.current, EASE_F);
      const cur = angleRef.current;

      /* Anima o tênis: float + leve rotação */
      if (sneakerRef.current) {
        const fy = Math.sin(clockRef.current * 1.1) * 10;
        const rz = Math.sin(clockRef.current * 0.5) * 3;
        sneakerRef.current.style.transform = `translate(-50%, -50%) translateY(${fy}px) rotate(${rz}deg)`;
      }

      objects.forEach((obj, i) => {
        const a = i * STEP + cur;
        obj.position.x = Math.sin(a) * ORBIT_RADIUS_X;
        obj.position.y = Math.sin(clockRef.current * 0.9 + i * 1.2) * Y_AMP;
        obj.position.z = Math.cos(a) * ORBIT_RADIUS_Z;
        obj.rotation.y = a;
        const depth = (Math.cos(a) + 1) / 2;
        obj.scale.setScalar(lerpF(0.70, 1.0, depth));
        const card = obj.userData.cardEl;
        card.style.opacity = lerpF(0.12, 0.82, depth);
        card.style.zIndex = Math.round(depth * 100);
        card.style.pointerEvents = depth > 0.48 ? "auto" : "none";
        const isHov = hoveredRef.current === i;
        const isFront = depth > 0.88 && hoveredRef.current === null;
        if (isHov) {
          card.style.border = "1px solid var(--gold-border)";
          card.style.boxShadow =
            "0 0 44px rgba(245,200,66,.32),var(--shadow-card)";
          card.style.background = "var(--surface)";
          card.style.transform = "scale(1.06)";
        } else if (isFront) {
          card.style.border = "1px solid var(--gold-border)";
          card.style.boxShadow =
            "0 0 28px rgba(245,200,66,.18),var(--shadow-card)";
          card.style.background = "var(--surface)";
          card.style.transform = "";
        } else {
          card.style.border = "1px solid var(--border)";
          card.style.boxShadow = "var(--shadow-card)";
          card.style.background = "var(--surface-2)";
          card.style.transform = "";
        }
      });
      renderer.render(scene, camera);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => {
      const w = el.clientWidth || 900,
        h = el.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const onDown = (e) => {
      dragging.current = true;
      dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      dragBase.current = targetAngle.current;
      try {
        e.currentTarget?.setPointerCapture?.(e.pointerId);
      } catch (_) {}
    };
    const onMoveP = (e) => {
      if (!dragging.current) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? dragStartX.current;
      targetAngle.current = dragBase.current + (x - dragStartX.current) * 0.003;
    };
    const onUp = () => {
      dragging.current = false;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMoveP);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMoveP);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      try {
        if (renderer.domElement && el.contains(renderer.domElement))
          el.removeChild(renderer.domElement);
        renderer.dispose?.();
      } catch (_) {}
    };
  }, []); // eslint-disable-line

  const btnSt = {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all .18s",
    flexShrink: "0",
  };

  return (
    <div style={{ userSelect: "none" }}>
      {/* Viewport — tênis no centro, cards orbitando */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "640px",
          overflow: "hidden",
          maskImage:
            "linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)",
        }}
      >
        {/* Halo dourado atrás do tênis */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-52%)",
            width: 560,
            height: 400,
            pointerEvents: "none",
            zIndex: 1,
            background:
              "radial-gradient(ellipse,rgba(245,200,66,.22) 0%,transparent 68%)",
          }}
        />

        {/* Reflexo no chão */}
        <div
          style={{
            position: "absolute",
            top: "62%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 180,
            height: 14,
            pointerEvents: "none",
            zIndex: 0,
            background:
              "radial-gradient(ellipse,rgba(245,200,66,.15) 0%,transparent 70%)",
            borderRadius: "50%",
            filter: "blur(4px)",
          }}
        />

        {/* Tênis central — troca ciclicamente com fade */}
        <div
          ref={sneakerRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-52%)",
            zIndex: 2,
            pointerEvents: "none",
            width: "520px",
            filter:
              "drop-shadow(0 8px 32px rgba(0,0,0,0.45)) drop-shadow(0 0 20px rgba(245,200,66,.22))",
            transition: "transform .05s linear",
          }}
        >
          <img
            src="/gucci_sneaker.png"
            alt="Tênis Gucci"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "480px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Canvas CSS3D — cards */}
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* Controles */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        <button
          onClick={() => {
            targetAngle.current -= STEP;
          }}
          aria-label="Anterior"
          style={btnSt}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--gold-border)";
            e.currentTarget.style.color = "var(--gold)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          ‹
        </button>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {DEPOIMENTOS.map((_, i) => (
            <button
              key={i}
              onClick={() => snapTo(i)}
              aria-label={`Depoimento ${i + 1}`}
              style={{
                width: i === activeIdx ? "22px" : "7px",
                height: "7px",
                borderRadius: "99px",
                border: "none",
                background: i === activeIdx ? "var(--gold)" : "var(--border)",
                cursor: "pointer",
                padding: "0",
                transition: "all .25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  i === activeIdx ? "var(--gold)" : "var(--border)";
              }}
            />
          ))}
        </div>

        <button
          onClick={() => {
            targetAngle.current += STEP;
          }}
          aria-label="Próximo"
          style={btnSt}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--gold-border)";
            e.currentTarget.style.color = "var(--gold)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════ */
function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { theme } = useApp();
  const logoSrc = getBrandLogo(theme);
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuAberto(false);
  };
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .navbar-links { display: none !important; }
          .navbar-actions { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .navbar-hamburger { display: none !important; }
          .navbar-mobile-menu { display: none !important; }
        }
      `}</style>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => scrollTo("hero")}
          style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <img
            src={logoSrc}
            alt="Lira Sneakers"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              objectFit: "cover",
              background: "var(--logo-tile)",
              border: "1px solid var(--gold-border)",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <span
            className="bebas"
            style={{ fontSize: 20, letterSpacing: "0.1em" }}
          >
            <span style={{ color: "var(--text)" }}>LIRA </span>
            <span className="shimmer-text">SNEAKERS</span>
          </span>
        </button>
        <nav className="navbar-links" style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[
            ["servicos-section", "Serviços"],
            ["antes-depois", "Antes & Depois"],
            ["depoimentos", "Depoimentos"],
            ["localizacao", "Localização"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "color .2s",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="navbar-actions" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <ThemeToggle compact />
          <button
            className="btn btn-gold"
            style={{ fontSize: 12, padding: "8px 16px" }}
            onClick={() =>
              abrirWpp(
                "Olá! Gostaria de solicitar um orçamento para o meu tênis.",
              )
            }
          >
            <Icon name="message-circle" size={14} /> Orçamento grátis
          </button>
        </div>
        <button
          className="navbar-hamburger"
          onClick={() => setMenuAberto((o) => !o)}
          aria-label="Menu"
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
          }}
        >
          <Icon name={menuAberto ? "x" : "menu"} size={20} />
        </button>
      </div>
      {menuAberto && (
        <div
          className="navbar-mobile-menu"
          style={{
            position: "absolute",
            top: 64,
            left: 0,
            right: 0,
            background: "var(--nav-bg)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border)",
            zIndex: 199,
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {[
            ["servicos-section", "Serviços"],
            ["antes-depois", "Antes & Depois"],
            ["depoimentos", "Depoimentos"],
            ["localizacao", "Localização"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
                padding: "12px 0",
                transition: "color .2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--gold)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              {label}
            </button>
          ))}
          <div style={{ display: "flex", gap: 10, paddingTop: 12 }}>
            <button
              className="btn btn-gold"
              style={{ fontSize: 12, flex: 1, justifyContent: "center" }}
              onClick={() => {
                abrirWpp("Olá! Gostaria de solicitar um orçamento para o meu tênis.");
                setMenuAberto(false);
              }}
            >
              <Icon name="message-circle" size={14} /> Orçamento grátis
            </button>
            <ThemeToggle compact />
          </div>
        </div>
      )}
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO — partículas em toda a seção
   ═══════════════════════════════════════════════════════════════ */
function Hero() {
  const { theme } = useApp();
  const logoSrc = getBrandLogo(theme);
  return (
    <>
    <section
      id="hero"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--bg)",
        minHeight: "100vh",
      }}
    >
      <ParticleBackground id="hero" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 20% 55%,rgba(245,200,66,.07) 0%,transparent 55%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle,rgba(245,200,66,.04) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <div
          className="hero-panel reveal reveal-delay-1"
          style={{
            borderBottom: "1px solid var(--border)",
            padding: "52px 24px 48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            background:
              "radial-gradient(ellipse at 50% 0%,rgba(245,200,66,.08) 0%,transparent 70%)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--gold-dim)",
              border: "1px solid var(--gold-border)",
              borderRadius: 99,
              padding: "5px 14px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--gold)",
                display: "block",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: "var(--gold)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
              }}
            >
              Sneaker Spa Profissional · São Paulo, SP
            </span>
          </div>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: -24,
                background:
                  "radial-gradient(circle,rgba(245,200,66,.18) 0%,transparent 70%)",
                borderRadius: "50%",
                filter: "blur(14px)",
              }}
            />
            <img
              src={logoSrc}
              alt="Lira Sneakers"
              className="anim-float"
              style={{
                width: 240,
                height: 240,
                borderRadius: 42,
                objectFit: "contain",
                objectPosition: "center 40%",
                background: "var(--logo-tile)",
                border: "2px solid var(--gold-border)",
                boxShadow:
                  "0 0 52px rgba(245,200,66,.24),0 8px 32px rgba(0,0,0,.55)",
                position: "relative",
                zIndex: 1,
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <p
              className="bebas"
              style={{
                fontSize: "clamp(52px,10vw,96px)",
                letterSpacing: "0.06em",
                lineHeight: 0.9,
              }}
            >
              <span style={{ color: "var(--text)" }}>LIRA </span>
              <span className="shimmer-text">SNEAKERS</span>
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.28em",
                marginTop: 10,
              }}
            >
              Sneaker Spa &nbsp;·&nbsp; Restauração &nbsp;·&nbsp; Proteção
            </p>
          </div>

          <div
            className="reveal reveal-delay-2"
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            <button
              className="btn btn-gold"
              style={{ fontSize: 13, padding: "13px 28px" }}
              onClick={() =>
                abrirWpp(
                  "Olá! Gostaria de solicitar um orçamento para o meu tênis.",
                )
              }
            >
              <Icon name="message-circle" size={16} /> Solicitar orçamento
              grátis
            </button>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 13, padding: "13px 22px" }}
              onClick={() =>
                document
                  .getElementById("servicos-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Icon name="scissors" size={16} /> Ver serviços
            </button>
          </div>

          <div
            className="reveal reveal-delay-3"
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              ["check-circle", "Orçamento sem compromisso"],
              ["check-circle", "Coleta e entrega disponível"],
              ["check-circle", "Garantia de satisfação"],
            ].map(([icon, txt]) => (
              <div
                key={txt}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Icon name={icon} size={13} style={{ color: "var(--green)" }} />
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {txt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    <section
      style={{
        background: "var(--bg)",
        padding: "64px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          className="landing-hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
          }}
        >
          <div>
            <h2
              className="bebas anim-fade-up"
              style={{
                fontSize: "clamp(40px,6vw,72px)",
                lineHeight: 0.9,
                letterSpacing: "0.02em",
                marginBottom: 20,
              }}
            >
              SEUS TÊNIS
              <br />
              <span className="shimmer-text">MERECEM</span>
              <br />O MELHOR
            </h2>
            <p
              className="anim-fade-up-1"
              style={{
                fontSize: 16,
                color: "var(--text-muted)",
                lineHeight: 1.65,
                maxWidth: 420,
                marginBottom: 28,
              }}
            >
              Restauração, limpeza e proteção especializada para seus
              sneakers. Do básico ao luxo — tratamos cada par com o cuidado
              que ele merece.
            </p>
            <button
              className="btn btn-ghost anim-fade-up-2"
              style={{ fontSize: 13, padding: "12px 22px" }}
              onClick={() =>
                document
                  .getElementById("servicos-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Icon name="list" size={15} /> Ver todos os serviços
            </button>
          </div>
          <div
            className="reveal reveal-delay-2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            {NUMEROS.map(({ valor, label }) => (
              <div
                key={label}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 18,
                  padding: "22px 16px",
                  textAlign: "center",
                }}
              >
                <p
                  className="bebas"
                  style={{
                    fontSize: 36,
                    color: "var(--gold)",
                    lineHeight: 1,
                  }}
                >
                  {valor}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginTop: 6,
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SERVIÇOS — partículas no fundo
   ═══════════════════════════════════════════════════════════════ */
function SecaoServicos() {
  const categorias = ["Todos", ...new Set(SERVICOS.map((s) => s.categoria))];
  const [filtro, setFiltro] = useState("Todos");
  const lista =
    filtro === "Todos"
      ? SERVICOS
      : SERVICOS.filter((s) => s.categoria === filtro);
  return (
    <section
      id="servicos-section"
      style={{ position: "relative", overflow: "hidden", padding: "80px 0", background: "var(--bg)" }}
    >
      <ParticleBackground id="servicos" />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "var(--gold)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 10,
            }}
          >
            O que fazemos
          </p>
          <h2
            className="bebas section-title reveal reveal-delay-1"
            style={{
              fontSize: "clamp(36px,5vw,52px)",
              letterSpacing: "0.04em",
            }}
          >
            NOSSOS SERVIÇOS
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-muted)",
              marginTop: 12,
              maxWidth: 480,
              margin: "12px auto 0",
            }}
          >
            Preços a partir de — valor final confirmado após avaliação do estado
            do tênis.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 36,
          }}
        >
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setFiltro(c)}
              style={{
                padding: "8px 18px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all .18s",
                border: "1px solid",
                background: filtro === c ? "var(--gold)" : "transparent",
                borderColor: filtro === c ? "var(--gold)" : "var(--border)",
                color:
                  filtro === c ? "var(--text-inverse)" : "var(--text-muted)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {lista.map((s, i) => (
            <div
              key={s.id}
              className="feature-card"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "20px 22px",
                transition: "all .2s",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  background: "var(--gold-dim)",
                  padding: "3px 8px",
                  borderRadius: 99,
                  border: "1px solid var(--gold-border)",
                }}
              >
                {s.categoria}
              </span>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: "var(--text)",
                  marginTop: 10,
                  marginBottom: 6,
                }}
              >
                {s.titulo}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                  marginBottom: 14,
                }}
              >
                {s.desc}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "var(--gold)",
                    }}
                  >
                    A partir de R$ {s.preco},00
                  </p>
                  {PRAZOS[s.titulo] && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 2,
                      }}
                    >
                      <Icon
                        name="clock"
                        size={11}
                        style={{ color: "var(--text-dim)" }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-dim)",
                          fontWeight: 600,
                        }}
                      >
                        {PRAZOS[s.titulo]}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-gold"
                  style={{ fontSize: 11, padding: "8px 14px" }}
                  onClick={() =>
                    abrirWpp(
                      `Olá! Gostaria de um orçamento para: ${s.titulo} (a partir de R$ ${s.preco},00).`,
                    )
                  }
                >
                  Solicitar
                </button>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: "var(--gold-dim)",
            border: "1px solid var(--gold-border)",
            borderRadius: 20,
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: "var(--gold)",
                marginBottom: 4,
              }}
            >
              Orçamento rápido pelo WhatsApp
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Envie fotos do seu tênis e receba um orçamento em minutos.
              Atendimento personalizado para cada caso.
            </p>
          </div>
          <button
            className="btn btn-gold"
            style={{ fontSize: 13, padding: "12px 24px", flexShrink: 0 }}
            onClick={() =>
              abrirWpp(
                "Olá! Gostaria de solicitar um orçamento para o meu tênis.",
              )
            }
          >
            <Icon name="message-circle" size={16} /> Solicitar orçamento
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANTES & DEPOIS — partículas no fundo
   ═══════════════════════════════════════════════════════════════ */
function SecaoAntesDepois() {
  return (
    <section
      id="antes-depois"
      className="landing-section-pad"
      style={{ position: "relative", overflow: "hidden", padding: "100px 0", background: "var(--bg)" }}
    >
      <ParticleBackground id="antesdepois" />
      <div
        className="landing-inner-pad"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--gold-dim)",
              border: "1px solid var(--gold-border)",
              borderRadius: 99,
              padding: "5px 14px",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--gold)",
                display: "block",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: "var(--gold)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
              }}
            >
              Resultados reais · pares reais
            </span>
          </div>
          <h2
            className="bebas reveal reveal-delay-1 section-title"
            style={{
              fontSize: "clamp(36px,5vw,64px)",
              letterSpacing: "0.04em",
              display: "block",
            }}
          >
            ANTES & <span className="shimmer-text">DEPOIS</span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-muted)",
              maxWidth: 500,
              margin: "16px auto 0",
              lineHeight: 1.65,
            }}
          >
            Arraste o slider para ver a transformação. Cada par é tratado com os
            produtos e técnicas certas.
          </p>
        </div>

        <div
          className="landing-ad-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 52,
            alignItems: "center",
          }}
        >
          <div className="reveal reveal-delay-1">
            <BeforeAfterSlider
              beforeSrc="/antes.jpeg"
              afterSrc="/depois.jpeg"
            />
            <p
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "var(--text-dim)",
                marginTop: 14,
                letterSpacing: "0.1em",
              }}
            >
              ← Arraste o slider para revelar →
            </p>
          </div>
          <div
            className="reveal reveal-delay-2"
            style={{ display: "flex", flexDirection: "column", gap: 28 }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                }}
              >
                Nike Court Vision — Limpeza Completa
              </span>
              <h3
                className="bebas"
                style={{
                  fontSize: "clamp(28px,3.5vw,44px)",
                  lineHeight: 1.1,
                  marginTop: 10,
                  marginBottom: 14,
                }}
              >
                De destruído a<br />
                <span style={{ color: "var(--gold)" }}>novo de fábrica</span>
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--text-muted)",
                  lineHeight: 1.75,
                }}
              >
                Limpeza profunda, remoção de manchas oxidadas, condicionamento
                do couro e clarificação da sola. Resultado em 3 dias.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                { icon: "clock", label: "Prazo", value: "3 dias úteis" },
                {
                  icon: "droplets",
                  label: "Processo",
                  value: "Limpeza profunda",
                },
                {
                  icon: "shield",
                  label: "Garantia",
                  value: "Satisfação total",
                },
                {
                  icon: "check-circle",
                  label: "Material",
                  value: "Couro preservado",
                },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <Icon
                      name={icon}
                      size={14}
                      style={{ color: "var(--gold)" }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        color: "var(--text-dim)",
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  <strong style={{ fontSize: 13, color: "var(--text)" }}>
                    {value}
                  </strong>
                </div>
              ))}
            </div>
            <button
              className="btn btn-gold"
              style={{
                fontSize: 13,
                padding: "14px 28px",
                alignSelf: "flex-start",
              }}
              onClick={() =>
                abrirWpp(
                  "Olá! Vi o resultado antes e depois no site e gostaria de um orçamento para o meu tênis.",
                )
              }
            >
              <Icon name="message-circle" size={16} /> Quero esse resultado
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DEPOIMENTOS — tênis Gucci + carousel 3D + partículas
   ═══════════════════════════════════════════════════════════════ */
