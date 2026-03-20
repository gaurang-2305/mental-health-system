import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Floating Particle ────────────────────────────────────────────────────────
function Particle({ style }) {
  return <div className="particle" style={style} />;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ end, label, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 2000;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="stat-item">
      <span className="stat-number">{count.toLocaleString()}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay, color }) {
  return (
    <div className="feature-card" style={{ '--delay': `${delay}ms`, '--accent': color }}>
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
      <div className="feature-glow" />
    </div>
  );
}

// ─── Testimonial ──────────────────────────────────────────────────────────────
function Testimonial({ text, name, role, avatar, delay }) {
  return (
    <div className="testimonial-card" style={{ '--delay': `${delay}ms` }}>
      <div className="testimonial-quote">"</div>
      <p className="testimonial-text">{text}</p>
      <div className="testimonial-author">
        <div className="testimonial-avatar">{avatar}</div>
        <div>
          <div className="testimonial-name">{name}</div>
          <div className="testimonial-role">{role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', onScroll);
    window.addEventListener('mousemove', onMouse);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse); };
  }, []);

  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${4 + Math.random() * 8}px`,
    height: `${4 + Math.random() * 8}px`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${6 + Math.random() * 8}s`,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  const features = [
    { icon: '🧠', title: 'AI-Powered Insights', desc: 'Intelligent analysis of your mood patterns, stress levels, and emotional wellbeing using advanced AI that actually understands context.', color: '#a07850', delay: 0 },
    { icon: '📊', title: 'Real-Time Tracking', desc: 'Track mood, sleep, stress, and lifestyle metrics daily. Watch your wellness journey unfold with beautiful, meaningful visualizations.', color: '#5a8a65', delay: 100 },
    { icon: '🤝', title: 'Counselor Connect', desc: 'Seamlessly book appointments with certified counselors. Get professional support exactly when you need it, without the wait.', color: '#4a7a9b', delay: 200 },
    { icon: '🔒', title: 'Complete Privacy', desc: 'Your mental health data is encrypted, confidential, and belongs only to you. We never share or monetize your personal information.', color: '#7a5ca0', delay: 300 },
    { icon: '💬', title: '24/7 AI Companion', desc: 'Our empathetic AI chatbot is always available to listen, offer coping strategies, and provide evidence-based support around the clock.', color: '#b84a4a', delay: 400 },
    { icon: '🎯', title: 'Goal Setting', desc: 'Set meaningful wellness goals, track your progress, and celebrate milestones. Build lasting habits that transform your mental health.', color: '#b88c18', delay: 500 },
  ];

  const testimonials = [
    { text: "MindCare helped me recognize my anxiety triggers before they overwhelmed me. The AI recommendations actually made sense for my situation.", name: "Priya S.", role: "Engineering Student", avatar: "P", delay: 0 },
    { text: "Finally an app that takes student mental health seriously. The counselor booking feature saved me during exam season.", name: "Arjun M.", role: "MBA Student", avatar: "A", delay: 150 },
    { text: "The mood tracking opened my eyes to patterns I never noticed. I sleep better, feel better, and perform better academically.", name: "Kavya R.", role: "Medical Student", avatar: "K", delay: 300 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --cream: #faf6ef;
          --cream2: #f5ede0;
          --warm: #ede5d8;
          --gold: #a07850;
          --gold-light: #c4a882;
          --gold-dark: #7a5c40;
          --forest: #3d5a45;
          --ink: #1e140a;
          --ink2: #4a3828;
          --ink3: #7a6048;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .hp-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
          color: var(--ink);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ─── Nav ─── */
        .hp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 20px 48px;
          display: flex; align-items: center; justify-content: space-between;
          transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .hp-nav.scrolled {
          background: rgba(250,246,239,0.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(160,120,80,0.15);
          padding: 14px 48px;
          box-shadow: 0 4px 24px rgba(80,50,20,0.08);
        }
        .nav-brand {
          display: flex; align-items: center; gap: 12px;
          text-decoration: none;
        }
        .nav-logo {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #3a2a18, #6b4e30);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(58,42,24,0.3);
        }
        .nav-brand-name {
          font-family: 'Fraunces', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: 0.01em;
        }
        .nav-links {
          display: flex; align-items: center; gap: 8px;
        }
        .nav-link {
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          color: var(--ink2);
          text-decoration: none;
          transition: all 0.2s;
          border: 1.5px solid transparent;
        }
        .nav-link:hover {
          color: var(--gold-dark);
          background: rgba(160,120,80,0.08);
          border-color: rgba(160,120,80,0.2);
        }
        .nav-cta {
          padding: 9px 24px;
          background: linear-gradient(135deg, #3a2a18, #6b4e30);
          color: #f5ede0 !important;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border: none !important;
          box-shadow: 0 4px 14px rgba(58,42,24,0.28);
          transition: all 0.2s;
        }
        .nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(58,42,24,0.36);
          background: linear-gradient(135deg, #2c1f12, #5c4228) !important;
        }

        /* ─── Hero ─── */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          position: relative;
          padding: 120px 48px 80px;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
        }
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: blobFloat 12s ease-in-out infinite;
        }
        .hero-blob-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(160,120,80,0.14), transparent 70%);
          top: -10%; right: -8%;
          animation-delay: 0s;
        }
        .hero-blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(90,138,101,0.12), transparent 70%);
          bottom: 10%; left: -5%;
          animation-delay: 4s;
        }
        .hero-blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(74,122,155,0.1), transparent 70%);
          top: 40%; left: 40%;
          animation-delay: 8s;
        }
        .hero-grain {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.4;
        }

        .particle {
          position: absolute;
          background: var(--gold);
          border-radius: 50%;
          animation: particleDrift linear infinite;
          pointer-events: none;
        }

        .hero-content {
          position: relative; z-index: 1;
          text-align: center;
          max-width: 900px;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 18px;
          background: rgba(160,120,80,0.1);
          border: 1px solid rgba(160,120,80,0.25);
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          color: var(--gold-dark);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 32px;
          animation: fadeSlideUp 0.8s ease both;
        }
        .hero-badge-dot {
          width: 7px; height: 7px;
          background: var(--gold);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .hero-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 600;
          line-height: 1.08;
          color: var(--ink);
          margin-bottom: 28px;
          letter-spacing: -0.02em;
          animation: fadeSlideUp 0.8s ease 0.15s both;
        }
        .hero-title em {
          font-style: italic;
          color: var(--gold-dark);
          position: relative;
          display: inline-block;
        }
        .hero-title em::after {
          content: '';
          position: absolute;
          bottom: 4px; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--gold), transparent);
          border-radius: 2px;
          transform-origin: left;
          animation: underlineGrow 1.2s ease 1s both;
        }
        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: var(--ink3);
          line-height: 1.75;
          max-width: 580px;
          margin: 0 auto 48px;
          font-weight: 400;
          animation: fadeSlideUp 0.8s ease 0.3s both;
        }
        .hero-actions {
          display: flex; align-items: center; justify-content: center;
          gap: 16px; flex-wrap: wrap;
          animation: fadeSlideUp 0.8s ease 0.45s both;
        }
        .btn-primary-hero {
          padding: 16px 40px;
          background: linear-gradient(135deg, #3a2a18, #6b4e30);
          color: #f5ede0;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          box-shadow: 0 8px 28px rgba(58,42,24,0.32), 0 0 0 0 rgba(160,120,80,0.4);
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          display: inline-flex; align-items: center; gap: 10px;
          letter-spacing: 0.01em;
          cursor: pointer;
        }
        .btn-primary-hero:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 14px 40px rgba(58,42,24,0.4), 0 0 0 6px rgba(160,120,80,0.12);
        }
        .btn-primary-hero .btn-arrow {
          transition: transform 0.25s;
        }
        .btn-primary-hero:hover .btn-arrow {
          transform: translateX(4px);
        }
        .btn-secondary-hero {
          padding: 15px 36px;
          background: rgba(255,252,248,0.8);
          color: var(--ink2);
          border-radius: 50px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          border: 1.5px solid rgba(160,120,80,0.28);
          backdrop-filter: blur(8px);
          transition: all 0.25s;
          display: inline-flex; align-items: center; gap: 8px;
          cursor: pointer;
        }
        .btn-secondary-hero:hover {
          border-color: rgba(160,120,80,0.55);
          background: rgba(255,252,248,0.95);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(80,50,20,0.1);
        }

        /* Scroll indicator */
        .scroll-hint {
          position: absolute; bottom: 40px; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          animation: fadeSlideUp 1s ease 1.5s both;
          z-index: 1;
        }
        .scroll-line {
          width: 1px; height: 48px;
          background: linear-gradient(to bottom, var(--gold), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        .scroll-text {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--gold-light);
          font-weight: 500;
        }

        /* ─── Floating cards decoration ─── */
        .hero-cards-float {
          position: absolute; z-index: 1;
          pointer-events: none;
        }
        .float-card {
          position: absolute;
          background: rgba(255,252,248,0.9);
          border: 1px solid rgba(160,120,80,0.18);
          border-radius: 16px;
          padding: 14px 18px;
          box-shadow: 0 8px 32px rgba(80,50,20,0.12);
          backdrop-filter: blur(12px);
          white-space: nowrap;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink2);
          display: flex; align-items: center; gap: 10px;
          animation: floatCard ease-in-out infinite;
        }
        .float-card-1 { left: -120px; top: 20%; animation-duration: 5s; animation-delay: 0.5s; }
        .float-card-2 { right: -100px; top: 35%; animation-duration: 6s; animation-delay: 1.5s; }
        .float-card-3 { left: -80px; bottom: 20%; animation-duration: 5.5s; animation-delay: 0.8s; }
        .float-dot { width: 10px; height: 10px; border-radius: 50%; }

        /* ─── Stats ─── */
        .stats-section {
          padding: 60px 48px;
          background: rgba(255,252,248,0.6);
          border-top: 1px solid rgba(160,120,80,0.12);
          border-bottom: 1px solid rgba(160,120,80,0.12);
        }
        .stats-inner {
          max-width: 1000px; margin: 0 auto;
          display: flex; justify-content: space-around; flex-wrap: wrap; gap: 32px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-number {
          display: block;
          font-family: 'Fraunces', serif;
          font-size: 3rem;
          font-weight: 700;
          color: var(--gold-dark);
          line-height: 1;
          margin-bottom: 8px;
        }
        .stat-label {
          font-size: 13px;
          color: var(--ink3);
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        /* ─── Features ─── */
        .features-section {
          padding: 100px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .section-header {
          text-align: center;
          margin-bottom: 72px;
        }
        .section-tag {
          display: inline-block;
          padding: 4px 16px;
          background: rgba(160,120,80,0.1);
          border: 1px solid rgba(160,120,80,0.22);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          color: var(--gold-dark);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 600;
          color: var(--ink);
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        .section-title em {
          font-style: italic;
          color: var(--gold-dark);
        }
        .section-subtitle {
          margin-top: 16px;
          font-size: 16px;
          color: var(--ink3);
          max-width: 480px;
          margin-left: auto; margin-right: auto;
          line-height: 1.7;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .features-grid { grid-template-columns: 1fr; } }

        .feature-card {
          background: rgba(255,252,248,0.9);
          border: 1px solid rgba(160,120,80,0.14);
          border-radius: 20px;
          padding: 32px 28px;
          position: relative;
          overflow: hidden;
          cursor: default;
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
          animation: fadeSlideUp 0.7s ease var(--delay, 0ms) both;
          box-shadow: 0 2px 12px rgba(80,50,20,0.06);
        }
        .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(160,120,80,0.3);
          box-shadow: 0 16px 48px rgba(80,50,20,0.14);
        }
        .feature-card:hover .feature-glow {
          opacity: 1;
        }
        .feature-glow {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-icon {
          font-size: 2.2rem;
          margin-bottom: 20px;
          display: block;
          filter: saturate(0.9);
        }
        .feature-title {
          font-family: 'Fraunces', serif;
          font-size: 1.15rem;
          font-weight: 500;
          color: var(--ink);
          margin-bottom: 12px;
        }
        .feature-desc {
          font-size: 14px;
          color: var(--ink3);
          line-height: 1.7;
        }

        /* ─── How it works ─── */
        .how-section {
          background: rgba(255,252,248,0.5);
          border-top: 1px solid rgba(160,120,80,0.1);
          border-bottom: 1px solid rgba(160,120,80,0.1);
          padding: 100px 48px;
        }
        .how-inner { max-width: 900px; margin: 0 auto; }
        .how-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 60px;
          position: relative;
        }
        .how-steps::before {
          content: '';
          position: absolute;
          top: 40px; left: 12%;
          width: 76%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(160,120,80,0.3), rgba(160,120,80,0.3), transparent);
          z-index: 0;
        }
        @media (max-width: 700px) { .how-steps { grid-template-columns: repeat(2, 1fr); } .how-steps::before { display: none; } }
        .how-step {
          text-align: center;
          position: relative;
          z-index: 1;
          animation: fadeSlideUp 0.7s ease calc(var(--n) * 120ms) both;
        }
        .how-number {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3a2a18, #6b4e30);
          color: #f5ede0;
          font-family: 'Fraunces', serif;
          font-size: 1.4rem;
          font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 6px 20px rgba(58,42,24,0.3);
          position: relative;
        }
        .how-step-title {
          font-family: 'Fraunces', serif;
          font-size: 1rem;
          color: var(--ink);
          margin-bottom: 8px;
          font-weight: 500;
        }
        .how-step-desc {
          font-size: 13px;
          color: var(--ink3);
          line-height: 1.6;
        }

        /* ─── Testimonials ─── */
        .testimonials-section {
          padding: 100px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 60px;
        }
        @media (max-width: 900px) { .testimonials-grid { grid-template-columns: 1fr; } }
        .testimonial-card {
          background: rgba(255,252,248,0.9);
          border: 1px solid rgba(160,120,80,0.14);
          border-radius: 20px;
          padding: 36px 32px;
          position: relative;
          animation: fadeSlideUp 0.7s ease var(--delay, 0ms) both;
          box-shadow: 0 2px 12px rgba(80,50,20,0.06);
          transition: all 0.3s;
        }
        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(80,50,20,0.12);
        }
        .testimonial-quote {
          font-family: 'Fraunces', serif;
          font-size: 5rem;
          color: rgba(160,120,80,0.15);
          line-height: 0.5;
          margin-bottom: 20px;
        }
        .testimonial-text {
          font-size: 15px;
          color: var(--ink2);
          line-height: 1.75;
          margin-bottom: 28px;
          font-style: italic;
        }
        .testimonial-author {
          display: flex; align-items: center; gap: 14px;
        }
        .testimonial-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3a2a18, #6b4e30);
          color: #f5ede0;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
        }
        .testimonial-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--ink);
        }
        .testimonial-role {
          font-size: 12px;
          color: var(--ink3);
          margin-top: 2px;
        }

        /* ─── CTA Section ─── */
        .cta-section {
          padding: 120px 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-bg {
          position: absolute; inset: 0;
          background: linear-gradient(160deg, #3a2a18 0%, #5c4228 40%, #3a2a18 100%);
          z-index: 0;
        }
        .cta-pattern {
          position: absolute; inset: 0; z-index: 0;
          background-image: radial-gradient(circle at 20% 50%, rgba(160,120,80,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(90,138,101,0.1) 0%, transparent 50%);
        }
        .cta-content {
          position: relative; z-index: 1;
          max-width: 640px; margin: 0 auto;
        }
        .cta-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 600;
          color: #f5ede0;
          line-height: 1.15;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }
        .cta-subtitle {
          font-size: 16px;
          color: rgba(245,237,224,0.7);
          line-height: 1.7;
          margin-bottom: 48px;
        }
        .cta-buttons {
          display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;
        }
        .btn-cta-white {
          padding: 16px 40px;
          background: #f5ede0;
          color: #3a2a18;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.25s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-cta-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          background: #fff;
        }
        .btn-cta-outline {
          padding: 15px 36px;
          background: transparent;
          color: rgba(245,237,224,0.85);
          border-radius: 50px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          border: 1.5px solid rgba(245,237,224,0.35);
          cursor: pointer;
          transition: all 0.25s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-cta-outline:hover {
          border-color: rgba(245,237,224,0.7);
          color: #f5ede0;
          transform: translateY(-2px);
        }

        /* ─── Footer ─── */
        .hp-footer {
          padding: 48px;
          background: rgba(255,252,248,0.6);
          border-top: 1px solid rgba(160,120,80,0.12);
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 20px;
        }
        .footer-brand {
          font-family: 'Fraunces', serif;
          font-size: 1.1rem;
          color: var(--ink);
          display: flex; align-items: center; gap: 10px;
        }
        .footer-copy {
          font-size: 13px;
          color: var(--ink3);
        }
        .footer-links {
          display: flex; gap: 24px;
        }
        .footer-link {
          font-size: 13px;
          color: var(--ink3);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: var(--gold-dark); }

        /* ─── Crisis bar ─── */
        .crisis-bar {
          background: rgba(184,74,74,0.08);
          border: 1px solid rgba(184,74,74,0.2);
          padding: 10px 48px;
          text-align: center;
          font-size: 13px;
          color: #b84a4a;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }

        /* ─── Keyframes ─── */
        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes particleDrift {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-80px) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes underlineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.5; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.1); }
        }
      `}</style>

      <div className="hp-root">
        {/* Crisis Bar */}
        <div className="crisis-bar">
          <span>🆘</span>
          <span>In crisis? Call iCall: <strong>9152987821</strong> or Vandrevala Foundation: <strong>1860-2662-345</strong> (24/7 Free)</span>
        </div>

        {/* Nav */}
        <nav className={`hp-nav${scrolled ? ' scrolled' : ''}`}>
          <Link to="/" className="nav-brand">
            <div className="nav-logo">✦</div>
            <span className="nav-brand-name">MindCare</span>
          </Link>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How it works</a>
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/register" className="nav-cta">Get Started →</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero" ref={heroRef}>
          <div className="hero-bg">
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-blob hero-blob-3" />
            <div className="hero-grain" />
            {particles.map((p, i) => <Particle key={i} style={p} />)}
          </div>

          {/* Floating decorative cards */}
          <div className="hero-cards-float" style={{ position: 'absolute', inset: 0 }}>
            <div className="float-card float-card-1" style={{ left: '5%', top: '28%' }}>
              <div className="float-dot" style={{ background: '#34d399' }} />
              Mood: 8/10 — Great day!
            </div>
            <div className="float-card float-card-2" style={{ right: '5%', top: '38%' }}>
              <div className="float-dot" style={{ background: '#4f8ef7' }} />
              Stress level: Low ✓
            </div>
            <div className="float-card float-card-3" style={{ left: '8%', bottom: '22%' }}>
              <div className="float-dot" style={{ background: '#fbbf24' }} />
              Sleep: 7.5h — Well rested
            </div>
          </div>

          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              AI-Powered Student Mental Health
            </div>
            <h1 className="hero-title">
              Your mind deserves<br />
              <em>care</em> and compassion
            </h1>
            <p className="hero-subtitle">
              MindCare is an intelligent mental wellness platform built for university students — 
              combining AI insights, expert counselors, and evidence-based tools to support your journey.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary-hero">
                Start your journey
                <span className="btn-arrow">→</span>
              </Link>
              <Link to="/login" className="btn-secondary-hero">
                Sign in
              </Link>
            </div>
          </div>

          <div className="scroll-hint">
            <span className="scroll-text">Explore</span>
            <div className="scroll-line" />
          </div>
        </section>

        {/* Stats */}
        <section className="stats-section">
          <div className="stats-inner">
            <Counter end={12000} label="Students supported" suffix="+" />
            <Counter end={95} label="Satisfaction rate" suffix="%" />
            <Counter end={48} label="Certified counselors" suffix="+" />
            <Counter end={24} label="Hours AI support" suffix="/7" />
          </div>
        </section>

        {/* Features */}
        <section className="features-section" id="features">
          <div className="section-header">
            <div className="section-tag">What we offer</div>
            <h2 className="section-title">
              Everything you need to<br /><em>thrive mentally</em>
            </h2>
            <p className="section-subtitle">
              A complete mental wellness toolkit thoughtfully crafted for the unique pressures of student life.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="how-section" id="how">
          <div className="how-inner">
            <div className="section-header">
              <div className="section-tag">Simple process</div>
              <h2 className="section-title">Get started in <em>minutes</em></h2>
              <p className="section-subtitle">No complicated setup. Just create your account and begin your wellness journey.</p>
            </div>
            <div className="how-steps">
              {[
                { n: 1, title: 'Create account', desc: 'Sign up in seconds with your university email' },
                { n: 2, title: 'Daily check-in', desc: 'Log your mood, sleep and how you\'re feeling' },
                { n: 3, title: 'AI insights', desc: 'Get personalised recommendations based on real data' },
                { n: 4, title: 'Get support', desc: 'Connect with counselors when you need expert help' },
              ].map((s) => (
                <div key={s.n} className="how-step" style={{ '--n': s.n }}>
                  <div className="how-number">{s.n}</div>
                  <div className="how-step-title">{s.title}</div>
                  <div className="how-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <div className="section-header">
            <div className="section-tag">Student stories</div>
            <h2 className="section-title">Real <em>transformation</em></h2>
            <p className="section-subtitle">Thousands of students have improved their mental wellbeing with MindCare.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => <Testimonial key={i} {...t} />)}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-bg" />
          <div className="cta-pattern" />
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to prioritise<br />your mental health?
            </h2>
            <p className="cta-subtitle">
              Join thousands of students who've taken the first step. Your journey to better mental wellbeing starts with a single click.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-cta-white">
                Create free account →
              </Link>
              <Link to="/login" className="btn-cta-outline">
                Already a member? Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="hp-footer">
          <div className="footer-brand">
            <div className="nav-logo" style={{ width: 32, height: 32, fontSize: 14 }}>✦</div>
            MindCare
          </div>
          <div className="footer-copy">
            © 2025 MindCare. Built with ✦ for student wellbeing.
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
        </footer>
      </div>
    </>
  );
}