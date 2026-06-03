import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { API_BASE } from '../api';

function setMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOg(property, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

const SeoHead = () => {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings.seo_meta_title) {
      document.title = settings.seo_meta_title;
    }
    setMeta('description', settings.seo_meta_description);
    setMeta('keywords', settings.seo_keywords);
    if (settings.seo_og_image) {
      const img = settings.seo_og_image.startsWith('http')
        ? settings.seo_og_image
        : `${API_BASE}${settings.seo_og_image}`;
      setOg('og:image', img);
      setOg('og:title', settings.seo_meta_title || settings.site_name);
      setOg('og:description', settings.seo_meta_description);
    }

    const ga = settings.seo_google_analytics_id;
    if (ga && !document.getElementById('ga-script')) {
      const s = document.createElement('script');
      s.id = 'ga-script';
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
      document.head.appendChild(s);
      const inline = document.createElement('script');
      inline.id = 'ga-inline';
      inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`;
      document.head.appendChild(inline);
    }

    const pixel = settings.seo_facebook_pixel_id;
    if (pixel && !document.getElementById('fb-pixel')) {
      const s = document.createElement('script');
      s.id = 'fb-pixel';
      s.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`;
      document.head.appendChild(s);
    }
  }, [
    settings.seo_meta_title,
    settings.seo_meta_description,
    settings.seo_keywords,
    settings.seo_og_image,
    settings.seo_google_analytics_id,
    settings.seo_facebook_pixel_id,
    settings.site_name,
  ]);

  return null;
};

export default SeoHead;
