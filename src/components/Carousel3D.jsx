import { useState, useRef, useCallback, useEffect } from "react";
import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import { DEPOIMENTOS } from "../data/constants";

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

function buildBadge(d) {
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
  return badge;
}

function buildAuthor(d) {
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
  return author;
}

function buildTextContent(d) {
  const frag = document.createElement("div");
  Object.assign(frag.style, {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: "1",
    minHeight: "0",
  });
  const stars = document.createElement("div");
  stars.style.cssText = "display:flex;gap:2px;flex-shrink:0;";
  stars.innerHTML = Array.from({ length: d.nota })
    .map(
      () =>
        `<span style="color:var(--gold);font-size:14px;line-height:1;">★</span>`,
    )
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
  frag.appendChild(stars);
  frag.appendChild(txt);
  frag.appendChild(buildBadge(d));
  frag.appendChild(buildAuthor(d));
  return frag;
}

function buildCaption(d) {
  const cap = document.createElement("div");
  Object.assign(cap.style, {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: "1",
    minHeight: "0",
    padding: "10px 16px",
    justifyContent: "space-between",
  });
  cap.appendChild(buildBadge(d));
  cap.appendChild(buildAuthor(d));
  return cap;
}

function buildCardEl(d) {
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    width: "300px",
    height: "200px",
    borderRadius: "16px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    userSelect: "none",
    transition:
      "border-color .28s,box-shadow .28s,background .28s,transform .18s",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-card)",
    willChange: "transform",
    backfaceVisibility: "hidden",
    touchAction: "none",
    fontFamily: "var(--font-body)",
    overflow: "hidden",
  });

  const renderText = () => {
    wrap.innerHTML = "";
    wrap.style.padding = "18px 20px";
    wrap.appendChild(buildTextContent(d));
  };

  if (d.print) {
    const img = document.createElement("img");
    img.src = d.print;
    img.alt = `Print de conversa — ${d.nome}`;
    img.draggable = false;
    Object.assign(img.style, {
      width: "100%",
      height: "150px",
      objectFit: "cover",
      display: "block",
      flexShrink: "0",
    });
    img.addEventListener("error", renderText);
    wrap.appendChild(img);
    wrap.appendChild(buildCaption(d));
  } else {
    renderText();
  }

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
  const frontRef = useRef([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState(null);

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
      cardEl.addEventListener("click", () => {
        if (frontRef.current[i] && d.print) {
          setLightboxSrc(d.print);
        } else {
          snapTo(i);
        }
      });
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
        frontRef.current[i] = isFront;
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
        className="carousel-viewport"
        style={{
          position: "relative",
          width: "100%",
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
            src="/gucci_sneaker.webp"
            alt="Tênis Gucci"
            loading="lazy"
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

      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            cursor: "zoom-out",
            padding: "24px",
          }}
        >
          <img
            src={lightboxSrc}
            alt="Print de conversa ampliado"
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              borderRadius: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxSrc(null);
            }}
            aria-label="Fechar"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default Carousel3D;
