import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const count = 20;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 20 + 15) + 's';
      p.style.animationDelay = (Math.random() * 20) + 's';
      p.style.background = ['var(--primary)', 'var(--secondary)', 'var(--accent)'][Math.floor(Math.random() * 3)];
      el.appendChild(p);
    }
    return () => { el.innerHTML = ''; };
  }, []);

  return <div ref={containerRef} className="particles-container" />;
}
