import React, { useEffect, useRef, useState } from 'react';

const ServiceCard = ({ service, currencySymbol, onOrder }) => {
  const sym = currencySymbol || '₹';
  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(false);

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
            <div className="services-card__meta-line">
              <span className="services-card__meta-tag">{service.platform}</span>
            </div>
            <div className="services-card__meta-line">
              <span>Min {Number(service.min_quantity).toLocaleString()}</span>
              <span aria-hidden="true">·</span>
              <span>Max {Number(service.max_quantity || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="services-card__footer">
            <div className="services-card__price-row">
              <span className="services-card__price">{sym}{parseFloat(service.price).toFixed(2)}</span>
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
