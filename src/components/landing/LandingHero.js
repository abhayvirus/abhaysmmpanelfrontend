import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandLogo from '../BrandLogo';
import DownloadAppButton from '../DownloadAppButton';
import LandingParticles from './LandingParticles';
import LandingStats from './LandingStats';
import { BRAND } from '../../config/brand';

const LandingHero = ({ settings, stats }) => (
  <section className="landing-hero" aria-labelledby="landing-hero-brand">
    <div className="landing-hero__bg" aria-hidden="true">
      <div className="landing-hero__gradient-orb landing-hero__gradient-orb--1" />
      <div className="landing-hero__gradient-orb landing-hero__gradient-orb--2" />
      <LandingParticles />
    </div>

    <div className="landing-hero__inner">
      <motion.div
        className="landing-hero__logo-wrap"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="landing-hero__logo-glow" aria-hidden="true" />
        <BrandLogo size="hero" showText={false} siteLogo={settings.site_logo} />
      </motion.div>

      <motion.h1
        id="landing-hero-brand"
        className="landing-hero__brand"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
      >
        <span className="landing-hero__brand-name">{BRAND.shortName}</span>
        <span className="landing-hero__brand-panel">{BRAND.panelLabel}</span>
      </motion.h1>

      <motion.p
        className="landing-hero__badge"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {BRAND.domain.replace('https://', '')}
      </motion.p>

      <motion.p
        className="landing-hero__title"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.45 }}
      >
        India&apos;s <span>Premium</span> SMM Panel
      </motion.p>

      <motion.p
        className="landing-hero__subtitle"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.45 }}
      >
        {settings.site_tagline || BRAND.tagline}
      </motion.p>

      <motion.div
        className="landing-hero__cta"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.45 }}
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
