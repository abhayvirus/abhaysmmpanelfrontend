import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandLogo from '../BrandLogo';
import DownloadAppButton from '../DownloadAppButton';
import LandingParticles from './LandingParticles';
import LandingStats from './LandingStats';
import { BRAND } from '../../config/brand';

const LandingHero = ({ settings, stats }) => (
  <section className="landing-hero" aria-labelledby="landing-hero-title">
    <div className="landing-hero__bg" aria-hidden="true">
      <div className="landing-hero__gradient-orb landing-hero__gradient-orb--1" />
      <div className="landing-hero__gradient-orb landing-hero__gradient-orb--2" />
      <LandingParticles />
    </div>

    <div className="landing-hero__inner">
      <motion.div
        className="landing-hero__logo-wrap"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="landing-hero__logo-glow" aria-hidden="true" />
        <BrandLogo size="hero" showText={false} siteLogo={settings.site_logo} />
      </motion.div>

      <motion.p
        className="landing-hero__badge"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
      >
        {BRAND.shortName} · {BRAND.domain.replace('https://', '')}
      </motion.p>

      <motion.h1
        id="landing-hero-title"
        className="landing-hero__title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.55 }}
      >
        India&apos;s <span>Premium</span> SMM Panel
      </motion.h1>

      <motion.p
        className="landing-hero__subtitle"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        {settings.site_tagline || BRAND.tagline}
      </motion.p>

      <motion.div
        className="landing-hero__cta"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        <Link to="/signup" className="landing-btn landing-btn--primary landing-btn--lg">
          Create Free Account
        </Link>
        <DownloadAppButton className="landing-btn landing-btn--glass" />
      </motion.div>

      <LandingStats stats={stats} />
    </div>
  </section>
);

export default LandingHero;
