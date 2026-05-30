import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/guidePage.css';

const renderCell = (col, sample) => {
  const val = sample?.[col];
  if (val && typeof val === 'object' && val.badge) {
    return <span className={`badge ${val.badge}`}>{val.text}</span>;
  }
  return val || '—';
};

const GuidePage = ({
  meta,
  sections,
  workflowSteps,
  statusFlow,
  quickNav = [],
  uiFeatures = [],
  backLink,
  backLabel,
  panelLabel = 'Panel navigation',
}) => {
  const [activeId, setActiveId] = useState('workflow');

  useEffect(() => {
    const ids = ['guide-workflow', ...sections.map((s) => `guide-${s.id}`)];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id.replace('guide-', ''));
        }
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: [0, 0.2, 0.5] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  return (
    <div className="guide-page">
      <header className="guide-hero card">
        <Link to={backLink} className="guide-back">
          ← {backLabel}
        </Link>
        <h1 className="guide-hero__title">{meta.title}</h1>
        <p className="guide-hero__subtitle">{meta.subtitle}</p>
      </header>

      {quickNav.length > 0 && (
        <nav className="guide-quick-nav card" aria-label={panelLabel}>
          <p className="guide-quick-nav__label">{panelLabel}</p>
          <div className="guide-quick-nav__grid">
            {quickNav.map((item) => (
              <Link key={item.to} to={item.to} className="guide-quick-nav__item">
                <span className="guide-quick-nav__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {uiFeatures.length > 0 && (
        <section className="guide-ui-features card" aria-label="UI features">
          <h2 className="guide-section__title guide-ui-features__title">Interface features</h2>
          <ul className="guide-ui-features__list">
            {uiFeatures.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="guide-layout">
        <nav className="guide-toc card" aria-label="Guide contents">
          <p className="guide-toc__label">Sections</p>
          <ul>
            <li>
              <a
                href="#guide-workflow"
                className={activeId === 'workflow' ? 'is-active' : ''}
                onClick={() => setActiveId('workflow')}
              >
                Real workflow
              </a>
            </li>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#guide-${s.id}`}
                  className={activeId === s.id ? 'is-active' : ''}
                  onClick={() => setActiveId(s.id)}
                >
                  {s.title.replace(/^\d+\.\s*/, '')}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="guide-main">
          <section id="guide-workflow" className="guide-section card">
            <h2 className="guide-section__title">Real workflow</h2>
            <p className="guide-section__summary">
              End-to-end flow from user login through admin processing to a permanent,
              read-only completed order.
            </p>
            <ol className="guide-workflow">
              {workflowSteps.map((w) => (
                <li key={w.step}>
                  <span className="guide-workflow__num">{w.step}</span>
                  <span>{w.text}</span>
                </li>
              ))}
            </ol>
          </section>

          {statusFlow && (
            <section className="guide-section card guide-status-overview">
              <h2 className="guide-section__title">Order status flow</h2>
              <div className="guide-status-row">
                {statusFlow.map((st, i) => (
                  <React.Fragment key={st.key}>
                    <div className="guide-status-chip">
                      <span className={`badge ${st.badge}`}>{st.label}</span>
                      {st.desc && <p>{st.desc}</p>}
                    </div>
                    {i < statusFlow.length - 1 && (
                      <span className="guide-status-arrow" aria-hidden="true">
                        →
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </section>
          )}

          {sections.map((section) => (
            <section
              key={section.id}
              id={`guide-${section.id}`}
              className="guide-section card"
            >
              <div className="guide-section__head">
                <span className="guide-section__icon" aria-hidden="true">
                  {section.icon}
                </span>
                <div>
                  <h2 className="guide-section__title">{section.title}</h2>
                  {section.route && (
                    <Link to={section.route} className="guide-section__link">
                      Open in panel →
                    </Link>
                  )}
                </div>
              </div>
              <p className="guide-section__summary">{section.summary}</p>

              {section.stats && (
                <div className="guide-stats-grid guide-stats-grid--values">
                  {section.stats.map((st) => (
                    <div key={st.label} className="guide-stat-card">
                      <div className="guide-stat-card__value">
                        {st.badge ? (
                          <span className={`badge ${st.badge}`}>{st.value}</span>
                        ) : (
                          st.value
                        )}
                      </div>
                      <div className="guide-stat-card__label">{st.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {section.filterChips && (
                <div className="guide-filter-demo" role="presentation">
                  <span className="guide-filter-demo__label">Filter by status:</span>
                  {section.filterChips.map((chip, i) => (
                    <span
                      key={chip}
                      className={`guide-filter-chip${i === 0 ? ' is-active' : ''}`}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              {section.tableColumns && (
                <div className="guide-table-wrap">
                  <table className="guide-table">
                    <thead>
                      <tr>
                        {section.tableColumns.map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {section.tableColumns.map((col) => (
                          <td key={col}>{renderCell(col, section.tableSampleRow)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                  <p className="guide-table-caption">Example row — your live data appears on the Orders page.</p>
                </div>
              )}

              <ul className="guide-list">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
