import React from 'react';

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 11) % 100}%`,
  size: 2 + (i % 4),
  delay: `${(i % 8) * 0.7}s`,
  duration: `${14 + (i % 6) * 2}s`,
}));

/** Lightweight CSS-only floating particles for hero background */
const LandingParticles = () => (
  <div className="landing-particles" aria-hidden="true">
    {PARTICLES.map((p) => (
      <span
        key={p.id}
        className="landing-particles__dot"
        style={{
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
          animationDelay: p.delay,
          animationDuration: p.duration,
        }}
      />
    ))}
  </div>
);

export default LandingParticles;
