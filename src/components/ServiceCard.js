import React, { useEffect, useRef, useState } from 'react';

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.00';
  return n.toFixed(2);
}

const ServiceCard = ({ service, currencySymbol, onOrder }) => {
  const sym = currencySymbol || '₹';
  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const platform = String(service.platform || '').trim();
  const minQty = Number(service.min_quantity);
  const maxQty = Number(service.max_quantity);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px 0px', threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [service.id]);

  return (
    <div ref={wrapRef} className="services-card-wrap">
      {visible ? (
        <article className="card services-card">
          <h3 className="services-card__title">{service.name}</h3>
          <div className="services-card__meta">
            {platform ? (
              <div className="services-card__meta-line">
                <span className="services-card__meta-tag">{platform}</span>
              </div>
            ) : null}
            <div className="services-card__meta-line">
              <span>Min {Number.isFinite(minQty) ? minQty.toLocaleString() : '—'}</span>
              <span aria-hidden="true">·</span>
              <span>Max {Number.isFinite(maxQty) ? maxQty.toLocaleString() : '—'}</span>
            </div>
          </div>
          <div className="services-card__footer">
            <div className="services-card__price-row">
              <span className="services-card__price">{sym}{formatPrice(service.price)}</span>
              <span className="services-card__price-unit">per 1000</span>
            </div>
            <button
              type="button"
              className="btn btn-primary services-card__order"
              onClick={() => onOrder(service)}
            >
              Order
            </button>
          </div>
        </article>
      ) : (
        <div className="services-card services-card--skeleton" aria-hidden="true" />
      )}
    </div>
  );
};

export default ServiceCard;
