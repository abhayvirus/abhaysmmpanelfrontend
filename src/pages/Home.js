import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getPublicStats, getServicesPreview } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import PublicNav from '../components/PublicNav';
import WhatsAppGroupPopup from '../components/WhatsAppGroupPopup';
import SocialProofSection from '../components/SocialProofSection';
import LandingHero from '../components/landing/LandingHero';
import LandingTrustBadges from '../components/landing/LandingTrustBadges';
import LandingWhyChoose from '../components/landing/LandingWhyChoose';
import LandingHowItWorks from '../components/landing/LandingHowItWorks';
import LandingServices from '../components/landing/LandingServices';
import LandingAppShowcase from '../components/landing/LandingAppShowcase';
import LandingWhatsAppGroup from '../components/landing/LandingWhatsAppGroup';
import LandingFooter from '../components/landing/LandingFooter';
import LandingLiveActivity from '../components/landing/LandingLiveActivity';
import LandingWatermark from '../components/landing/LandingWatermark';
import { getPostLoginPath } from '../utils/authRedirect';
import { BRAND } from '../config/brand';
import '../styles/homePage.css';
import '../styles/landingAppCommunity.css';
import '../styles/landingResponsive.css';

const Home = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState({});
  const [services, setServices] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('token')));
  const sym = settings.currency_symbol || '₹';

  useEffect(() => {
    getPublicStats().then((r) => setStats(r.data || {})).catch(() => {});
    getServicesPreview()
      .then((r) => setServices(Array.isArray(r.data) ? r.data : []))
      .catch(() => setServices([]));
  }, []);

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(Boolean(localStorage.getItem('token')));
    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  useEffect(() => {
    if (window.location.hash === '#services') {
      const el = document.getElementById('services');
      if (el) {
        const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        return () => clearTimeout(t);
      }
    }
    return undefined;
  }, [services]);

  useEffect(() => {
    const title = settings.site_name || BRAND.name;
    document.title = `${title} — Premium SMM Panel India`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', settings.site_tagline || BRAND.tagline);
    }
  }, [settings.site_name, settings.site_tagline]);

  if (isLoggedIn) {
    return <Navigate to={getPostLoginPath()} replace />;
  }

  return (
    <div className="home-page landing-page">
      <LandingWatermark />
      <PublicNav />
      <WhatsAppGroupPopup />

      <main className="landing-main">
        <LandingHero settings={settings} stats={stats} />
        <LandingTrustBadges />
        <LandingHowItWorks />
        <LandingServices services={services} sym={sym} />
        <LandingWhyChoose />
        <LandingAppShowcase />
        <LandingLiveActivity />
        <LandingWhatsAppGroup />
        <SocialProofSection />
      </main>

      <LandingFooter settings={settings} />
    </div>
  );
};

export default Home;
