import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInViewOnce } from '../../hooks/useInViewOnce';

const TESTIMONIALS = [
  {
    name: 'Rahul K.',
    role: 'Instagram Creator',
    text: 'ABHAYSMM delivers faster than any panel I used before. Support on Telegram is instant.',
    rating: 5,
  },
  {
    name: 'Priya S.',
    role: 'Agency Owner',
    text: 'Clean dashboard, Razorpay top-ups, and API access — perfect for scaling client campaigns.',
    rating: 5,
  },
  {
    name: 'Arjun M.',
    role: 'YouTube Reseller',
    text: 'Pricing is competitive and order success rate is excellent. Highly recommended for India.',
    rating: 5,
  },
  {
    name: 'Neha T.',
    role: 'SMM Reseller',
    text: 'Refill support and stable services made this my primary panel. Professional experience.',
    rating: 5,
  },
];

const Stars = ({ count }) => (
  <span className="landing-testimonials__stars" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: count }, (_, i) => (
      <span key={i} aria-hidden="true">★</span>
    ))}
  </span>
);

const LandingTestimonials = () => {
  const { ref, inView } = useInViewOnce(0.15);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(id);
  }, [inView]);

  const current = TESTIMONIALS[index];

  return (
    <section className="landing-section landing-testimonials" ref={ref} aria-labelledby="landing-testimonials-title">
      <div className="landing-section__container landing-testimonials__container">
        <motion.header
          className="landing-section__header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="landing-section__eyebrow">Testimonials</p>
          <h2 id="landing-testimonials-title" className="landing-section__title">Loved by Resellers</h2>
        </motion.header>

        <div className="landing-testimonials__carousel">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              className="landing-testimonials__slide"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
            >
              <Stars count={current.rating} />
              <p className="landing-testimonials__text">&ldquo;{current.text}&rdquo;</p>
              <footer>
                <cite className="landing-testimonials__name">{current.name}</cite>
                <span className="landing-testimonials__role">{current.role}</span>
              </footer>
            </motion.blockquote>
          </AnimatePresence>

          <div className="landing-testimonials__dots" role="tablist" aria-label="Testimonial slides">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Review ${i + 1}`}
                className={`landing-testimonials__dot${i === index ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
