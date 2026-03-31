import { useEffect, useRef } from "react";
import "./Hero.css";

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId, time = 0;
    let particles = [], nebulae = [];
    let W, H;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    /* ── Nebula clouds ── */
    function makeNebula() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        rx: 80 + Math.random() * 160, ry: 40 + Math.random() * 100,
        angle: Math.random() * Math.PI,
        speed: (Math.random() - 0.5) * 0.001,
        hue: ["gold", "teal", "purple"][Math.floor(Math.random() * 3)],
        op: 0.04 + Math.random() * 0.06,
      };
    }
    function initNebulae() {
      nebulae = [];
      for (let i = 0; i < 8; i++) nebulae.push(makeNebula());
    }
    function drawNebulae() {
      nebulae.forEach((n) => {
        n.angle += n.speed;
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(n.angle);
        const map = { gold: [201,168,76], teal: [0,245,212], purple: [123,94,167] };
        const [r, g, b] = map[n.hue];
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx);
        grd.addColorStop(0, `rgba(${r},${g},${b},${n.op})`);
        grd.addColorStop(1, "transparent");
        ctx.scale(1, n.ry / n.rx);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(0, 0, n.rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    /* ── Particles ── */
    function makeParticle() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.2,
        type: Math.floor(Math.random() * 3),
        op: 0.3 + Math.random() * 0.7,
        twinkle: Math.random() * Math.PI * 2,
      };
    }
    function initParticles() {
      particles = [];
      for (let i = 0; i < 160; i++) particles.push(makeParticle());
    }
    function drawParticles() {
      const cols = ["rgba(201,168,76,", "rgba(0,245,212,", "rgba(200,190,255,"];
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        p.twinkle += 0.03;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const tw = 0.5 + 0.5 * Math.sin(p.twinkle);
        const op = p.op * tw;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = cols[p.type] + op + ")";
        ctx.fill();
        if (p.r > 1.0 && tw > 0.8) {
          ctx.strokeStyle = cols[p.type] + op * 0.5 + ")";
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(p.x - 5, p.y); ctx.lineTo(p.x + 5, p.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(p.x, p.y - 5); ctx.lineTo(p.x, p.y + 5); ctx.stroke();
        }
      });
    }

    /* ── Connections ── */
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201,168,76,${(1 - dist / 80) * 0.07})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
    }

    /* ── 3D projection ── */
    function project(x, y, z, cx, cy, fov) {
      const zz = z + fov;
      const sc = fov / zz;
      return { x: cx + x * sc, y: cy + y * sc, sc };
    }

    /* ── Orbital rings ── */
    function drawRings(cx, cy, t) {
      const fov = 340;
      const rings = [
        { r: 200, tilt: 0.45, speed:  0.14, col: "rgba(201,168,76,",  thick: 1.8, dots: 16 },
        { r: 270, tilt: 1.05, speed: -0.09, col: "rgba(0,245,212,",   thick: 1.0, dots: 12 },
        { r: 340, tilt: 0.28, speed:  0.06, col: "rgba(180,160,255,", thick: 0.7, dots: 10 },
        { r: 145, tilt: 1.45, speed: -0.19, col: "rgba(240,208,128,", thick: 1.2, dots: 8  },
        { r: 420, tilt: 0.70, speed:  0.04, col: "rgba(201,168,76,",  thick: 0.4, dots: 20 },
      ];

      rings.forEach((ring) => {
        const pts = 240;
        const ang = t * ring.speed;
        const points = [];

        for (let i = 0; i <= pts; i++) {
          const a = (i / pts) * Math.PI * 2;
          const rx = Math.cos(a) * ring.r;
          const ry = Math.sin(a) * ring.r;
          const y3 = ry * Math.cos(ring.tilt);
          const z3 = ry * Math.sin(ring.tilt);
          const x3 = rx * Math.cos(ang) - z3 * Math.sin(ang);
          const zz = rx * Math.sin(ang) + z3 * Math.cos(ang);
          points.push(project(x3, y3, zz, cx, cy, fov));
        }

        for (let i = 0; i < pts; i++) {
          const p1 = points[i], p2 = points[i + 1];
          const dep = Math.max(0, Math.min(1, (p1.sc - 0.35) * 2.2));
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = ring.col + dep * 0.8 + ")";
          ctx.lineWidth = ring.thick * p1.sc;
          ctx.stroke();
        }

        const step = Math.floor(pts / ring.dots);
        points.forEach((p, i) => {
          if (i % step !== 0) return;
          const dep = Math.max(0, Math.min(1, (p.sc - 0.35) * 2.2));
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 5 * p.sc);
          grd.addColorStop(0, ring.col + dep * 0.9 + ")");
          grd.addColorStop(1, ring.col + "0)");
          ctx.beginPath(); ctx.arc(p.x, p.y, 5 * p.sc, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.8 * p.sc, 0, Math.PI * 2);
          ctx.fillStyle = ring.col + dep + ")"; ctx.fill();
        });
      });
    }

    /* ── Hex grid ── */
    function drawHexGrid() {
      const size = 38;
      const cols2 = Math.ceil(W / size / 1.5) + 2;
      const rows2 = Math.ceil(H / size / 1.73) + 2;
      ctx.strokeStyle = "rgba(201,168,76,0.025)";
      ctx.lineWidth = 0.5;
      for (let row = -2; row < rows2; row++) {
        for (let col = -2; col < cols2; col++) {
          const x = col * size * 1.5;
          const y = row * size * 1.732 + (col % 2) * size * 0.866;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI / 180) * (60 * k - 30);
            const px = x + size * Math.cos(a);
            const py = y + size * Math.sin(a);
            k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.stroke();
        }
      }
    }

    /* ── Center glow ── */
    function drawGlow(cx, cy) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 330);
      g.addColorStop(0, "rgba(123,94,167,0.22)");
      g.addColorStop(0.35, "rgba(201,168,76,0.08)");
      g.addColorStop(0.7, "rgba(0,245,212,0.03)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function loop() {
      time += 0.011;
      ctx.fillStyle = "rgba(4,2,15,0.22)";
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2 - 40;
      drawHexGrid();
      drawNebulae();
      drawGlow(cx, cy);
      drawConnections();
      drawRings(cx, cy, time);
      drawParticles();
      animId = requestAnimationFrame(loop);
    }

    resize(); initParticles(); initNebulae(); loop();
    const onResize = () => { resize(); initParticles(); initNebulae(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <section className="hero">
      <canvas ref={canvasRef} className="hero__canvas" />
      <div className="hero__grain" />
      <div className="hero__scanline" />
      <div className="bracket bracket--tl" />
      <div className="bracket bracket--tr" />
      <div className="bracket bracket--bl" />
      <div className="bracket bracket--br" />

      <div className="hero__inner">
        <div className="hero__eyebrow">
          <div className="eyebrow__line eyebrow__line--l" />
          <span className="eyebrow__text">Est. 2019 · Faridpur, Bangladesh</span>
          <div className="eyebrow__line eyebrow__line--r" />
        </div>

        <div className="hero__headline-wrap">
          <span className="hl-top">The Future Belongs To</span>
          <span className="hl-main">GRAVITY COMPILE</span>
          <div className="hl-sub-wrap">
            <div className="hl-sub-line" />
            <span className="hl-sub">Software &amp; Technology Agency</span>
            <div className="hl-sub-line" />
          </div>
        </div>

        <p className="hero__desc">
          We don't just write code — we architect{" "}
          <em>digital civilizations</em>.<br />
          Apps, platforms &amp; experiences engineered for the next decade.
        </p>

        <div className="hero__btns">
          <button className="btn-gold"><span>Start a Project</span></button>
          <button className="btn-ghost">Explore Our Work</button>
        </div>
      </div>

      <div className="hero__stats">
        {[
          { n: "120+", l: "Projects" },
          { n: "50+",  l: "Clients"  },
          { n: "5+",   l: "Years"    },
          { n: "98%",  l: "Satisfaction" },
          { n: "5",    l: "Departments" },
        ].map((s) => (
          <div className="hero__stat" key={s.l}>
            <div className="stat__num">{s.n}</div>
            <div className="stat__label">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}