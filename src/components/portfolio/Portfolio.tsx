'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './portfolio.module.css';
import { fallbackProjects, skillGroups, timeline, sectionIds, type Project } from './data';
import WebGLBackground from './WebGLBackground';

const CYAN = 'oklch(0.8 0.17 195)';
const CYAN_BRIGHT = 'oklch(0.85 0.16 195)';
const CYAN_LABEL = 'oklch(0.78 0.17 195)';

type SectionId = (typeof sectionIds)[number];

export default function Portfolio() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statVals, setStatVals] = useState({ years: 0, projects: 0, clients: 0 });
  const [statsStarted, setStatsStarted] = useState(false);
  const [revealed, setRevealed] = useState<Record<SectionId, boolean>>({
    about: false,
    work: false,
    skills: false,
    timeline: false,
    contact: false,
  });
  const [liveProjects, setLiveProjects] = useState<Project[] | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('about');

  const glowRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const throttled = useRef(false);
  const statsStartedRef = useRef(false);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1080;

  useEffect(() => {
    const checkReveal = () => {
      const vh = window.innerHeight;
      setRevealed((prev) => {
        let changed = false;
        const next = { ...prev };
        sectionIds.forEach((id) => {
          if (prev[id]) return;
          const el = document.getElementById(id);
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.92 && r.bottom > 0) {
            next[id] = true;
            changed = true;
          }
        });
        if (changed && next.about && !statsStartedRef.current) {
          statsStartedRef.current = true;
          startStatCount();
        }
        return changed ? next : prev;
      });
    };

    const updateActiveSection = () => {
      let current: SectionId = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.4) current = id;
      }
      setActiveSection((prev) => (prev !== current ? current : prev));
    };

    const onScroll = () => {
      if (throttled.current) return;
      throttled.current = true;
      setTimeout(() => {
        throttled.current = false;
        checkReveal();
        setNavScrolled(window.scrollY > 40);
        updateActiveSection();
      }, 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      setWidth(window.innerWidth);
      checkReveal();
    };
    window.addEventListener('resize', onResize);

    checkReveal();
    const t = setTimeout(checkReveal, 300);

    fetch('https://api.github.com/users/ruk13xa/repos?sort=pushed&per_page=100')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((repos: { private: boolean; fork: boolean; stargazers_count?: number; name: string; description?: string; language?: string; html_url: string }[]) => {
        const list: Project[] = repos
          .filter((r) => !r.private && !r.fork)
          .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
          .slice(0, 4)
          .map((r, i) => ({
            index: String(i + 1).padStart(2, '0'),
            title: r.name,
            desc: r.description || '설명 없음',
            tags: [r.language, `★ ${r.stargazers_count}`].filter(Boolean) as string[],
            href: r.html_url,
          }));
        if (list.length) setLiveProjects(list);
      })
      .catch(() => {});

    let onCursorMove: ((e: MouseEvent) => void) | undefined;
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
      onCursorMove = (e: MouseEvent) => {
        if (cursorRef.current) {
          cursorRef.current.style.display = 'block';
          cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        }
      };
      window.addEventListener('mousemove', onCursorMove, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (onCursorMove) window.removeEventListener('mousemove', onCursorMove);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startStatCount = () => {
    setStatsStarted(true);
    const targets = { years: 5, projects: 32, clients: 12 };
    const duration = 1100;
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setStatVals({
        years: Math.round(targets.years * ease),
        projects: Math.round(targets.projects * ease),
        clients: Math.round(targets.clients * ease),
      });
      if (t < 1) setTimeout(tick, 40);
    };
    tick();
  };
  void statsStarted;

  const reveal3d = (on: boolean): React.CSSProperties =>
    on
      ? {
          opacity: 1,
          transform: 'perspective(1400px) rotateX(0deg) translateY(0) scale(1)',
          transition: 'opacity 0.9s cubic-bezier(.2,.7,.2,1), transform 0.9s cubic-bezier(.2,.7,.2,1)',
          transformOrigin: 'top center',
        }
      : {
          opacity: 0,
          transform: 'perspective(1400px) rotateX(14deg) translateY(70px) scale(0.96)',
          transition: 'opacity 0.9s cubic-bezier(.2,.7,.2,1), transform 0.9s cubic-bezier(.2,.7,.2,1)',
          transformOrigin: 'top center',
        };

  const revealChild = (on: boolean): React.CSSProperties =>
    on
      ? { opacity: 1, transform: 'translateY(0)', transition: 'opacity 0.8s ease, transform 0.8s ease' }
      : { opacity: 0, transform: 'translateY(28px)', transition: 'opacity 0.8s ease, transform 0.8s ease' };

  const navLinkStyle = (id: SectionId): React.CSSProperties => ({
    color: activeSection === id ? CYAN_BRIGHT : 'inherit',
    textDecoration: 'none',
    position: 'relative',
    paddingBottom: 4,
    transition: 'color 0.25s ease',
  });

  const navLinkUnderline = (id: SectionId): React.CSSProperties =>
    activeSection === id
      ? {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 1.5,
          background: CYAN,
          boxShadow: '0 0 8px oklch(0.8 0.17 195 / 0.7)',
        }
      : { display: 'none' };

  const pagePad = isMobile ? '0 20px' : '0 64px';
  const sectionPad = isMobile ? '72px 20px' : '120px 64px';

  const projects = liveProjects || fallbackProjects;

  const onHeroMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!glowRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 240;
    const y = e.clientY - rect.top - 240;
    glowRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const navLabels: { id: SectionId; label: string }[] = [
    { id: 'about', label: '01 / ABOUT' },
    { id: 'work', label: '02 / WORK' },
    { id: 'skills', label: '03 / STACK' },
    { id: 'timeline', label: '04 / TIMELINE' },
    { id: 'contact', label: '05 / CONTACT' },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.mesh} />
      <div className={styles.radials} />
      <div className={styles.grid} />
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.topScan} />
      <div className={styles.vignette} />
      <WebGLBackground />

      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: navScrolled ? (isMobile ? '10px 20px' : '14px 64px') : isMobile ? '18px 20px' : '24px 64px',
          backdropFilter: 'blur(12px)',
          background: `oklch(0.05 0.01 240 / ${navScrolled ? '0.85' : '0.6'})`,
          borderBottom: `1px solid oklch(0.55 0.15 195 / ${navScrolled ? '0.55' : '0.35'})`,
          boxShadow: `0 1px ${navScrolled ? '32px' : '24px'} oklch(0.6 0.16 195 / ${navScrolled ? '0.25' : '0.15'})`,
          transition: 'padding 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              border: '1.5px solid oklch(0.8 0.17 195 / 0.8)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontWeight: 700,
              fontSize: 16,
              color: CYAN_BRIGHT,
              boxShadow: '0 0 16px oklch(0.75 0.17 195 / 0.35)',
              position: 'relative',
            }}
          >
            <span>R</span>
            <span
              style={{
                position: 'absolute',
                top: -1.5,
                left: -1.5,
                right: -1.5,
                bottom: -1.5,
                border: '1px solid oklch(0.8 0.17 195 / 0.4)',
                borderRadius: 8,
                clipPath: 'polygon(0 0, 30% 0, 30% 8%, 8% 8%, 8% 30%, 0 30%)',
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: -1.5,
                left: -1.5,
                right: -1.5,
                bottom: -1.5,
                border: '1px solid oklch(0.8 0.17 195 / 0.4)',
                borderRadius: 8,
                clipPath: 'polygon(70% 100%, 100% 100%, 100% 70%, 92% 70%, 92% 92%, 70% 92%)',
                pointerEvents: 'none',
              }}
            />
          </div>
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 18, letterSpacing: '0.05em', color: CYAN_BRIGHT }}>
            ruka<span style={{ color: 'oklch(0.92 0.005 240)' }}>.my</span>
          </div>
        </div>
        <div
          style={{
            display: isMobile ? 'none' : 'flex',
            gap: 36,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 13,
            letterSpacing: '0.05em',
            color: 'oklch(0.75 0.02 240)',
          }}
        >
          {navLabels.map(({ id, label }) => (
            <a key={id} href={`#${id}`} style={navLinkStyle(id)}>
              {label}
              <span style={navLinkUnderline(id)} />
            </a>
          ))}
        </div>
        {isMobile && (
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="menu"
            style={{
              background: 'none',
              border: '1px solid oklch(0.4 0.05 220)',
              borderRadius: 2,
              width: 40,
              height: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 18,
                height: 2,
                background: CYAN_BRIGHT,
                transition: 'transform 0.25s ease',
                transform: menuOpen ? 'translateY(7px) rotate(45deg)' : undefined,
              }}
            />
            <span
              style={{
                width: 18,
                height: 2,
                background: CYAN_BRIGHT,
                transition: 'opacity 0.2s ease',
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                width: 18,
                height: 2,
                background: CYAN_BRIGHT,
                transition: 'transform 0.25s ease',
                transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : undefined,
              }}
            />
          </button>
        )}
      </nav>

      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: navScrolled ? 60 : 76,
            left: 0,
            right: 0,
            zIndex: 19,
            background: 'oklch(0.05 0.01 240 / 0.98)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid oklch(0.3 0.05 220 / 0.3)',
            padding: '20px 20px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 16,
            letterSpacing: '0.05em',
          }}
        >
          {navLabels.map(({ id, label }) => (
            <a
              key={id}
              onClick={() => setMenuOpen(false)}
              href={`#${id}`}
              style={{ color: 'oklch(0.9 0.005 240)', textDecoration: 'none' }}
            >
              {label}
            </a>
          ))}
        </div>
      )}

      <section
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '88vh',
          padding: pagePad,
          marginTop: 76,
          overflow: 'hidden',
        }}
        onMouseMove={onHeroMove}
      >
        <div className={styles.heroScan} />
        <div
          ref={glowRef}
          style={{
            position: 'absolute',
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, oklch(0.6 0.15 195 / 0.16), transparent 70%)',
            left: -240,
            top: -240,
            pointerEvents: 'none',
            transition: 'transform 0.15s ease-out',
          }}
        />
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />
        <div
          className={styles.eyebrow}
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 14,
            letterSpacing: '0.2em',
            color: CYAN_LABEL,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            className={styles.eyebrowDot}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: CYAN,
              boxShadow: `0 0 12px ${CYAN}`,
            }}
          />
          AVAILABLE FOR WORK — 2026
        </div>
        <h1
          className={styles.h1}
          style={{
            fontSize: 'clamp(56px, 9vw, 128px)',
            lineHeight: 0.95,
            margin: 0,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          RUKA
          <br />
          <span style={{ color: 'transparent', WebkitTextStroke: `1.5px ${CYAN}` }}>CODE</span>
          <span className={styles.blinkCursor} style={{ color: CYAN, WebkitTextStroke: 0 }}>
            _
          </span>
        </h1>
        <p
          className={styles.heroBody}
          style={{
            maxWidth: 640,
            fontSize: 20,
            lineHeight: 1.6,
            color: 'oklch(0.7 0.02 240)',
            marginTop: 32,
          }}
        >
          인터페이스와 인터랙션의 경계를 실험하는 디자인 엔지니어. 데이터, 모션, 시스템을 다루며 다음 세대의 디지털 경험을 설계합니다.
        </p>
        <div className={styles.heroCtas} style={{ display: 'flex', gap: 20, marginTop: 44 }}>
          <a
            href="#work"
            className={styles.ctaPrimary}
            style={{
              textDecoration: 'none',
              padding: '16px 32px',
              background: CYAN,
              color: '#05070a',
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: '0.05em',
              borderRadius: 2,
              display: 'inline-block',
            }}
          >
            VIEW WORK →
          </a>
          <a
            href="#contact"
            className={styles.ctaSecondary}
            style={{
              textDecoration: 'none',
              padding: '16px 32px',
              border: '1px solid oklch(0.4 0.05 220)',
              color: 'oklch(0.9 0.005 240)',
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: '0.05em',
              borderRadius: 2,
              display: 'inline-block',
            }}
          >
            CONTACT
          </a>
        </div>
      </section>

      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 16,
          height: 16,
          margin: -8,
          borderRadius: '50%',
          background: 'oklch(0.8 0.18 195 / 0.9)',
          boxShadow: '0 0 18px 6px oklch(0.8 0.18 195 / 0.5)',
          pointerEvents: 'none',
          zIndex: 50,
          mixBlendMode: 'screen',
          display: 'none',
        }}
      />

      <section
        id="about"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: sectionPad,
          borderTop: '1px solid oklch(0.55 0.14 195 / 0.3)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '220px 1fr',
          gap: isMobile ? 20 : 64,
          ...reveal3d(revealed.about),
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 13,
            letterSpacing: '0.15em',
            color: CYAN_LABEL,
            ...revealChild(revealed.about),
          }}
        >
          01 / ABOUT
        </div>
        <div style={{ maxWidth: 820, ...revealChild(revealed.about) }}>
          <h2 style={{ fontSize: 40, fontWeight: 600, margin: '0 0 28px', lineHeight: 1.3 }}>
            기술과 감각 사이, 그 경계에서 작업합니다.
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: 'oklch(0.7 0.02 240)', margin: '0 0 20px' }}>
            서울에서 공부하는 학생 개발자입니다. TypeScript, Python, Swift, C++ 등 다양한 언어와 React·Next.js·Three.js를
            넘나들며 프로젝트를 진행합니다.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: 'oklch(0.7 0.02 240)', margin: 0 }}>
            TensorFlow 기반 AI 실험과 Figma를 활용한 디자인 작업을 함께 병행하며, 코드와 비주얼의 경계를 넘나드는 작업을
            지향합니다.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: isMobile ? 28 : 48,
              marginTop: 48,
            }}
          >
            {[
              { label: 'YEARS EXP', display: `${statVals.years}+` },
              { label: 'PROJECTS', display: `${statVals.projects}` },
              { label: 'CLIENTS', display: `${statVals.clients}` },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 36, fontWeight: 700, color: CYAN_BRIGHT, fontVariantNumeric: 'tabular-nums' }}>
                  {s.display}
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: 'oklch(0.6 0.02 240)', letterSpacing: '0.05em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="work"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: sectionPad,
          borderTop: '1px solid oklch(0.55 0.14 195 / 0.3)',
          ...reveal3d(revealed.work),
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56 }}>
          <div style={revealChild(revealed.work)}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, letterSpacing: '0.15em', color: CYAN_LABEL, marginBottom: 16 }}>
              02 / WORK
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 600, margin: 0 }}>셀렉티드 프로젝트</h2>
          </div>
        </div>
        {projects.map((p) => (
          <a
            key={p.title}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.projectRow}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 320px 160px 40px',
              alignItems: 'center',
              gap: isMobile ? 10 : 32,
              padding: '32px 24px',
              textDecoration: 'none',
              color: 'inherit',
              borderTop: '1px solid oklch(0.3 0.05 220 / 0.3)',
              ...revealChild(revealed.work),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
              <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 14, color: 'oklch(0.6 0.02 240)' }}>
                {p.index}
              </span>
              <span className={styles.projectTitle} style={{ fontSize: 28, fontWeight: 600 }}>
                {p.title}
              </span>
            </div>
            <div style={{ fontSize: 15, color: 'oklch(0.65 0.02 240)' }}>{p.desc}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    letterSpacing: '0.05em',
                    padding: '5px 10px',
                    border: '1px solid oklch(0.4 0.05 220)',
                    borderRadius: 999,
                    color: CYAN_LABEL,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <span style={{ fontSize: 24, color: CYAN_LABEL, justifySelf: 'end' }}>↗</span>
          </a>
        ))}
      </section>

      <section
        id="skills"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: sectionPad,
          borderTop: '1px solid oklch(0.55 0.14 195 / 0.3)',
          ...reveal3d(revealed.skills),
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 13,
            letterSpacing: '0.15em',
            color: CYAN_LABEL,
            marginBottom: 16,
            ...revealChild(revealed.skills),
          }}
        >
          03 / STACK
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 600, margin: '0 0 56px', ...revealChild(revealed.skills) }}>기술 스택</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: 1,
            background: 'oklch(0.3 0.05 220 / 0.3)',
          }}
        >
          {skillGroups.map((g) => (
            <div key={g.title} className={styles.skillCard} style={{ padding: 36, ...revealChild(revealed.skills) }}>
              <div
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 12,
                  letterSpacing: '0.1em',
                  color: CYAN_LABEL,
                  marginBottom: 20,
                }}
              >
                {g.title}
              </div>
              {g.items.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid oklch(0.25 0.03 220 / 0.4)',
                    fontSize: 16,
                  }}
                >
                  <span>{item.name}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: 'oklch(0.6 0.02 240)' }}>
                    {item.level}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section
        id="timeline"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: sectionPad,
          borderTop: '1px solid oklch(0.55 0.14 195 / 0.3)',
          ...reveal3d(revealed.timeline),
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 13,
            letterSpacing: '0.15em',
            color: CYAN_LABEL,
            marginBottom: 16,
            ...revealChild(revealed.timeline),
          }}
        >
          04 / TIMELINE
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 600, margin: '0 0 56px', ...revealChild(revealed.timeline) }}>경력</h2>
        <div
          style={{
            position: 'relative',
            paddingLeft: 40,
            borderLeft: '1px solid oklch(0.3 0.05 220 / 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 56,
          }}
        >
          {timeline.map((t, i) => (
            <div key={i} style={{ position: 'relative', ...revealChild(revealed.timeline) }}>
              <span
                className={styles.timelineDot}
                style={{
                  position: 'absolute',
                  left: -45,
                  top: 4,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#05070a',
                  border: `2px solid ${CYAN}`,
                  boxShadow: `0 0 12px oklch(0.8 0.18 195 / 0.6)`,
                }}
              />
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, color: CYAN_LABEL, marginBottom: 8 }}>
                {t.period}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
                {t.role} — {t.org}
              </div>
              <div style={{ fontSize: 16, color: 'oklch(0.65 0.02 240)', maxWidth: 640, lineHeight: 1.6 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="contact"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: sectionPad,
          borderTop: '1px solid oklch(0.55 0.14 195 / 0.3)',
          textAlign: 'center',
          ...reveal3d(revealed.contact),
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 13,
            letterSpacing: '0.15em',
            color: CYAN_LABEL,
            marginBottom: 24,
            ...revealChild(revealed.contact),
          }}
        >
          05 / CONTACT
        </div>
        <h2
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 700,
            margin: '0 0 28px',
            letterSpacing: '-0.02em',
            ...revealChild(revealed.contact),
          }}
        >
          다음 프로젝트를
          <br />
          함께 만들어봐요
        </h2>
        <a
          href="mailto:ruka@ruka.my"
          className={styles.contactEmail}
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 22,
            color: CYAN_BRIGHT,
            textDecoration: 'none',
            borderBottom: '1px solid oklch(0.5 0.1 195)',
            ...revealChild(revealed.contact),
          }}
        >
          ruka@ruka.my
        </a>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '24px 32px',
            marginTop: 44,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 14,
            color: 'oklch(0.65 0.02 240)',
          }}
        >
          <a href="https://github.com/ruk13xa" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
            GITHUB
          </a>
          <a href="https://velog.io/@ruk13xa" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
            VELOG
          </a>
        </div>
        <div style={{ marginTop: 100, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: 'oklch(0.4 0.02 240)' }}>
          © 2026 RUKA. ALL RIGHTS RESERVED.
        </div>
      </section>
    </div>
  );
}
