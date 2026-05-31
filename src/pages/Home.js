import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getPublicStats, getServicesPreview } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import PublicNav from '../components/PublicNav';
import StickyAnnouncementBar from '../components/StickyAnnouncementBar';
import SocialProofSection from '../components/SocialProofSection';
import LandingWatermark from '../components/landing/LandingWatermark';
import LandingHero from '../components/landing/LandingHero';
import LandingTrustBadges from '../components/landing/LandingTrustBadges';
import LandingWhyChoose from '../components/landing/LandingWhyChoose';
import LandingServices from '../components/landing/LandingServices';
import LandingTestimonials from '../components/landing/LandingTestimonials';
import LandingTelegramSection from '../components/landing/LandingTelegramSection';
import LandingFooter from '../components/landing/LandingFooter';
import { getPostLoginPath, isAuthenticated } from '../utils/authRedirect';
import { BRAND } from '../config/brand';
import '../styles/homePage.css';

const Home = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState({});
  const [services, setServices] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('token')));
  const sym = settings.currency_symbol || '₹';

  useEffect(() => {
    getPublicStats().then((r) => setStats(r.data)).catch(() => {});
    getServicesPreview().then((r) => setServices(r.data)).catch(() => {});
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
      <StickyAnnouncementBar />

      <main>
        <LandingHero settings={settings} stats={stats} />

        <LandingTrustBadges />

        <LandingWhyChoose />

        {services.length > 0 && (
          <LandingServices services={services} sym={sym} />
        )}

        <LandingTestimonials />

        <SocialProofSection />

        <LandingTelegramSection />
      </main>

      <LandingFooter settings={settings} />
    </div>
  );
};

export default Home;
