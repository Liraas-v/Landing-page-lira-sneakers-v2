import { lazy, Suspense, useState, useEffect, useRef, useCallback } from "react";
import Icon from "../components/Icon";
import ThemeToggle from "../components/ThemeToggle";
import WhatsAppButton from "../components/WhatsAppButton";
import WhatsAppFloating from "../components/WhatsAppFloating";
import { useApp } from "../context/AppContext";
import { getBrandLogo } from "../data/brand";
import {
  SERVICOS,
  PRAZOS,
  LOCATION,
  NUMEROS,
  FAQ_ITEMS,
  TAXA_URGENCIA,
  HERO_BENEFICIO,
} from "../data/constants";
const Carousel3D = lazy(() => import("../components/Carousel3D"));

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

    const isMobile = W < 768;
    const COUNT = isMobile
      ? Math.min(Math.floor((W * H) / 9000), 45)
      : Math.min(Math.floor((W * H) / 6000), 140);
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

        if (!isMobile) {
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
        touchAction: "none",
        boxShadow: "0 12px 48px rgba(0,0,0,0.55), 0 0 0 1px var(--border)",
      }}
    >
      <img
        src={afterSrc}
        alt="Depois"
        draggable="false"
        loading="lazy"
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
          loading="lazy"
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
          .navbar-actions { gap: 8px !important; }
          .navbar-theme-desktop { display: none !important; }
          .navbar-actions .btn { font-size: 11px !important; padding: 7px 12px !important; }
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
            ["faq", "Dúvidas"],
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
          <span className="navbar-theme-desktop">
            <ThemeToggle compact />
          </span>
          <WhatsAppButton
            className="btn btn-gold"
            style={{ fontSize: 12, padding: "8px 16px" }}
            mensagem="Olá! Gostaria de solicitar um orçamento para o meu tênis."
          >
            <Icon name="message-circle" size={14} /> Orçamento grátis
          </WhatsAppButton>
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
            ["faq", "Dúvidas"],
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
            <WhatsAppButton
              className="btn btn-gold"
              style={{ fontSize: 12, flex: 1, justifyContent: "center" }}
              mensagem="Olá! Gostaria de solicitar um orçamento para o meu tênis."
              onClick={() => setMenuAberto(false)}
            >
              <Icon name="message-circle" size={14} /> Orçamento grátis
            </WhatsAppButton>
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
            <h1
              className="bebas"
              style={{
                fontSize: "clamp(52px,10vw,96px)",
                letterSpacing: "0.06em",
                lineHeight: 0.9,
              }}
            >
              <span style={{ color: "var(--text)" }}>LIRA </span>
              <span className="shimmer-text">SNEAKERS</span>
            </h1>
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

            <p
              style={{
                fontSize: 15,
                color: "var(--text)",
                fontWeight: 600,
                margin: "14px auto 0",
                maxWidth: 360,
              }}
            >
              {HERO_BENEFICIO}
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
            <WhatsAppButton
              className="btn btn-gold"
              style={{ fontSize: 13, padding: "13px 28px" }}
              mensagem="Olá! Gostaria de solicitar um orçamento para o meu tênis."
            >
              <Icon name="message-circle" size={16} /> Solicitar orçamento
              grátis
            </WhatsAppButton>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 13, padding: "13px 22px" }}
              onClick={() =>
                document
                  .getElementById("servicos-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Icon name="list" size={16} /> Ver serviços
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
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
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
                <WhatsAppButton
                  className="btn btn-gold"
                  style={{ fontSize: 11, padding: "8px 14px" }}
                  mensagem={`Olá! Gostaria de um orçamento para: ${s.titulo} (a partir de R$ ${s.preco},00).`}
                >
                  Solicitar
                </WhatsAppButton>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 12.5,
            color: "var(--text-dim)",
            marginBottom: 20,
            padding: "10px 16px",
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            borderRadius: 12,
          }}
        >
          <Icon name="clock" size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />
          <span>
            <strong style={{ color: "var(--text-muted)" }}>Precisa com urgência?</strong>{" "}
            {TAXA_URGENCIA.desc} (+R$ {TAXA_URGENCIA.preco},00)
          </span>
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
          <WhatsAppButton
            className="btn btn-gold"
            style={{ fontSize: 13, padding: "12px 24px", flexShrink: 0 }}
            mensagem="Olá! Gostaria de solicitar um orçamento para o meu tênis."
          >
            <Icon name="message-circle" size={16} /> Solicitar orçamento
          </WhatsAppButton>
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
              beforeSrc="/antes.webp"
              afterSrc="/depois.webp"
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
            <WhatsAppButton
              className="btn btn-gold"
              style={{
                fontSize: 13,
                padding: "14px 28px",
                alignSelf: "flex-start",
              }}
              mensagem="Olá! Vi o resultado antes e depois no site e gostaria de um orçamento para o meu tênis."
            >
              <Icon name="message-circle" size={16} /> Quero esse resultado
            </WhatsAppButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DEPOIMENTOS — tênis Gucci + carousel 3D + partículas
   ═══════════════════════════════════════════════════════════════ */
function SecaoDepoimentos() {
  const wrapRef = useRef(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPronto(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="depoimentos"
      style={{ position: "relative", overflow: "hidden", padding: "80px 0", background: "var(--bg)" }}
    >
      <ParticleBackground id="depoimentos" />
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 400,
          pointerEvents: "none",
          zIndex: 1,
          background:
            "radial-gradient(ellipse,rgba(245,200,66,.07) 0%,transparent 68%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 44 }}>
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
            O que dizem nossos clientes
          </p>
          <h2
            className="bebas section-title reveal reveal-delay-1"
            style={{
              fontSize: "clamp(36px,5vw,52px)",
              letterSpacing: "0.04em",
            }}
          >
            DEPOIMENTOS
          </h2>
          <p
            style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 16 }}
          >
            Arraste para girar &nbsp;·&nbsp; hover para pausar &nbsp;·&nbsp;
            clique nos dots para navegar
          </p>
        </div>
      </div>
      <div ref={wrapRef} style={{ position: "relative", zIndex: 2, minHeight: 640 }}>
        {pronto ? (
          <Suspense fallback={<div style={{ height: 640 }} />}>
            <Carousel3D />
          </Suspense>
        ) : (
          <div style={{ height: 640 }} />
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOCALIZAÇÃO — partículas no fundo
   ═══════════════════════════════════════════════════════════════ */
function SecaoLocalizacao() {
  return (
    <section
      id="localizacao"
      className="landing-section-pad"
      style={{ position: "relative", overflow: "hidden", padding: "80px 0", background: "var(--bg)" }}
    >
      <ParticleBackground id="localizacao" />
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
            Onde estamos
          </p>
          <h2
            className="bebas section-title reveal reveal-delay-1"
            style={{
              fontSize: "clamp(36px,5vw,52px)",
              letterSpacing: "0.04em",
            }}
          >
            LOCALIZAÇÃO & ATENDIMENTO
          </h2>
        </div>
        <div
          className="landing-loc-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                padding: "24px 26px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <Icon
                  name="map-pin"
                  size={18}
                  style={{ color: "var(--gold)" }}
                />
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Área de Atendimento
                </p>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.65,
                  marginBottom: 16,
                }}
              >
                {LOCATION.descricao}
              </p>
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  {LOCATION.endereco} — {LOCATION.bairro}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-dim)",
                    margin: "2px 0 0",
                  }}
                >
                  {LOCATION.cidade} - {LOCATION.estado}, CEP {LOCATION.cep}
                </p>
              </div>
              <a
                href={LOCATION.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--gold)",
                  textDecoration: "none",
                }}
              >
                <Icon name="map-pin" size={14} />
                Ver no mapa
              </a>
            </div>
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                padding: "24px 26px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <Icon name="clock" size={18} style={{ color: "var(--gold)" }} />
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Horário de Atendimento
                </p>
              </div>
              {LOCATION.horarios.map(({ dia, hora }) => (
                <div
                  key={dia}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "9px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {dia}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--gold)",
                    }}
                  >
                    {hora}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              background:
                "radial-gradient(ellipse at 0% 0%,rgba(245,200,66,.1) 0%,var(--bg) 60%)",
              border: "1px solid var(--gold-border)",
              borderRadius: 18,
              padding: "28px 26px",
            }}
          >
            <p
              className="bebas"
              style={{ fontSize: 26, letterSpacing: "0.06em", marginBottom: 8 }}
            >
              FALE COM A GENTE
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.6,
                marginBottom: 22,
              }}
            >
              Tire dúvidas, solicite um orçamento ou agende a coleta.
              Respondemos em até 1 hora.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <WhatsAppButton
                className="btn btn-gold"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  fontSize: 14,
                  padding: "14px",
                }}
                mensagem="Olá! Gostaria de solicitar um orçamento."
              >
                <Icon name="message-circle" size={18} /> Solicitar orçamento via
                WhatsApp
              </WhatsAppButton>
              <WhatsAppButton
                className="btn btn-ghost"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  fontSize: 13,
                  padding: "12px",
                }}
                mensagem="Olá! Gostaria de saber mais sobre a coleta do meu tênis."
              >
                <Icon name="package" size={16} /> Agendar coleta
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAQ — accordion, partículas no fundo
   ═══════════════════════════════════════════════════════════════ */
function SecaoFaq() {
  const [abertoId, setAbertoId] = useState(null);
  return (
    <section
      id="faq"
      style={{ position: "relative", overflow: "hidden", padding: "80px 0", background: "var(--bg)" }}
    >
      <ParticleBackground id="faq" />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 44 }}>
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
            Dúvidas frequentes
          </p>
          <h2
            className="bebas section-title reveal reveal-delay-1"
            style={{ fontSize: "clamp(36px,5vw,52px)", letterSpacing: "0.04em" }}
          >
            PERGUNTAS FREQUENTES
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQ_ITEMS.map((item) => {
            const aberto = abertoId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setAbertoId(aberto ? null : item.id)}
                  aria-expanded={aberto}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "16px 20px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                    {item.pergunta}
                  </span>
                  <Icon
                    name={aberto ? "chevron-up" : "chevron-down"}
                    size={18}
                    style={{ color: "var(--gold)", flexShrink: 0 }}
                  />
                </button>
                {aberto && (
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "var(--text-muted)",
                      lineHeight: 1.65,
                      padding: "0 20px 18px",
                      margin: 0,
                    }}
                  >
                    {item.resposta}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
            Não achou sua dúvida aqui?
          </p>
          <WhatsAppButton
            className="btn btn-ghost"
            style={{ fontSize: 13, padding: "12px 22px" }}
            mensagem="Olá! Tenho uma dúvida que não vi no site."
          >
            <Icon name="message-circle" size={15} /> Falar com a gente
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */
function Footer() {
  const NAV = [
    {
      label: "Serviços",
      action: () =>
        document
          .getElementById("servicos-section")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "Antes & Depois",
      action: () =>
        document
          .getElementById("antes-depois")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "Depoimentos",
      action: () =>
        document
          .getElementById("depoimentos")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "Dúvidas",
      action: () =>
        document
          .getElementById("faq")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "Orçamento",
      mensagem: "Olá! Gostaria de solicitar um orçamento para o meu tênis.",
    },
  ];
  const SOC = [
    {
      label: "Instagram",
      url: "https://instagram.com/lirasneakerslab",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      label: "TikTok",
      url: "https://www.tiktok.com/@lirasneakerslab",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      url: "https://wa.me/message/PZN2UQGAF3TOG1",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.03 14.7 2 12.04 2zm0 18.15h-.01c-1.51 0-2.99-.41-4.28-1.17l-.31-.18-3.19.84.85-3.11-.2-.32a8.19 8.19 0 01-1.26-4.4c0-4.54 3.69-8.23 8.24-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.22-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29z" />
        </svg>
      ),
    },
  ];
  return (
    <footer
      style={{
        background: "var(--footer-bg)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div
        className="landing-footer-grid"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "48px 24px 32px",
          display: "grid",
          gridTemplateColumns: "1.8fr 1fr 1fr",
          gap: 48,
        }}
      >
        <div>
          <span
            className="bebas"
            style={{
              fontSize: 17,
              letterSpacing: "0.12em",
              color: "var(--text)",
            }}
          >
            LIRA SNEAKERS
          </span>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.7,
              maxWidth: 300,
              marginTop: 10,
            }}
          >
            Serviço especializado em limpeza, restauração e proteção de sneakers
            em São Paulo.
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "var(--text-dim)",
              marginBottom: 18,
            }}
          >
            Produto
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {NAV.map(({ label, action, mensagem }) => {
              const sharedStyle = {
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--text-muted)",
                padding: 0,
                transition: "color .18s",
                fontFamily: "var(--font-body)",
                textDecoration: "none",
                display: "block",
              };
              const hoverHandlers = {
                onMouseEnter: (e) => { e.currentTarget.style.color = "var(--gold)"; },
                onMouseLeave: (e) => { e.currentTarget.style.color = "var(--text-muted)"; },
              };
              return mensagem ? (
                <WhatsAppButton key={label} mensagem={mensagem} style={sharedStyle} {...hoverHandlers}>
                  {label}
                </WhatsAppButton>
              ) : (
                <button key={label} onClick={action} style={sharedStyle} {...hoverHandlers}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "var(--text-dim)",
              marginBottom: 18,
            }}
          >
            Siga-me
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SOC.map(({ label, url, icon }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  fontSize: 13,
                  transition: "color .18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                {icon} {label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p style={{ fontSize: 11, color: "var(--text-dim)" }}>
          © {new Date().getFullYear()} Lira Sneakers. Feito para quem leva
          sneakers a sério.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--text-dim)",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "5px 12px",
            cursor: "pointer",
            transition: "all .18s",
            fontFamily: "var(--font-body)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--gold-border)";
            e.currentTarget.style.color = "var(--gold)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-dim)";
          }}
        >
          Topo ↑
        </button>
      </div>
    </footer>
  );
}


/* ═══════════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <Navbar />
      <Hero />
      <SecaoServicos />
      <SecaoAntesDepois />
      <SecaoDepoimentos />
      <SecaoLocalizacao />
      <SecaoFaq />
      <Footer />
      <WhatsAppFloating />
      <style>{`
        .reveal{opacity:0;transform:translateY(40px) scale(0.98);transition:opacity .68s cubic-bezier(0.22,1,0.36,1),transform .68s cubic-bezier(0.22,1,0.36,1);will-change:opacity,transform}
        .reveal.visible{opacity:1;transform:translateY(0) scale(1)}
        .reveal-delay-1{transition-delay:.08s}.reveal-delay-2{transition-delay:.16s}
        .reveal-delay-3{transition-delay:.24s}.reveal-delay-4{transition-delay:.32s}
        .reveal-delay-5{transition-delay:.40s}
        .hero-panel{background:color-mix(in srgb,var(--surface) 88%,transparent);border:1px solid var(--border);border-radius:28px;box-shadow:var(--shadow-card);backdrop-filter:blur(14px)}
        .feature-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow-card);transition:transform .28s,border-color .28s,box-shadow .28s}
        .feature-card:hover{transform:translateY(-8px);border-color:var(--gold-border);box-shadow:var(--shadow-gold)}
        .section-panel{background:var(--surface);border:1px solid var(--border);border-radius:28px;box-shadow:var(--shadow-card)}
        .section-title{position:relative}
        .section-title::after{content:"";position:absolute;left:50%;bottom:-10px;width:100px;height:4px;background:linear-gradient(90deg,transparent,rgba(245,200,66,.8),transparent);transform:translateX(-50%);border-radius:999px}
        .carousel-viewport{height:640px;}
        @media(max-width:900px){
          .reveal{transform:translateY(24px) scale(0.99)}
        }
        @media(max-width:768px){
          .landing-hero-grid{grid-template-columns:1fr !important; gap:40px !important;}
          .landing-ad-grid{grid-template-columns:1fr !important; gap:36px !important;}
          .landing-loc-grid{grid-template-columns:1fr !important; gap:20px !important;}
          .landing-footer-grid{grid-template-columns:1fr !important; gap:32px !important;}
          .carousel-viewport{height:480px !important;}
          .landing-section-pad{padding:60px 0 !important;}
          .landing-inner-pad{padding:0 16px !important;}
        }
        @media(min-width:769px) and (max-width:1024px) and (orientation:landscape){
          .carousel-viewport{height:420px !important;}
        }
      `}</style>
    </div>
  );
}
