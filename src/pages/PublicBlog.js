import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../components/PublicPageShell';
import { useSettings } from '../contexts/SettingsContext';
import { BRAND } from '../config/brand';
import { resolveTelegramChannelUrl } from '../constants/telegramChannel';
import { PUBLIC_BLOG_POSTS, SUPPORT_WHATSAPP } from '../content/publicPages';
import '../styles/publicGuidePage.css';

const PublicBlog = () => {
  const { settings } = useSettings();
  const telegramUrl = resolveTelegramChannelUrl(settings);

  useEffect(() => {
    document.title = `Blog & Updates — ${BRAND.name}`;
  }, []);

  return (
    <PublicPageShell className="public-simple-page">
      <article className="public-simple-card public-simple-card--wide">
        <p className="legal-doc__eyebrow">Blog</p>
        <h1>Tips & updates</h1>
        <p className="public-simple-lead">
          Helpful guides for using {BRAND.name} — wallet, orders, and support.
        </p>

        <div className="public-blog-list">
          {PUBLIC_BLOG_POSTS.map((post) => (
            <section key={post.id} id={post.id} className="public-blog-post">
              <p className="public-blog-post__date">{post.date}</p>
              <h2>{post.title}</h2>
              {post.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="public-simple-actions">
          <Link to="/how-to-use" className="btn btn-primary">
            How to Use Guide
          </Link>
          <a href={telegramUrl} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
            Telegram Updates
          </a>
          <a
            href={SUPPORT_WHATSAPP.waUrl}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp Support
          </a>
        </div>
      </article>
    </PublicPageShell>
  );
};

export default PublicBlog;
