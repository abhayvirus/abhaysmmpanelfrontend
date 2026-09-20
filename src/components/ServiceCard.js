import React, { useEffect, useRef, useState } from 'react';
import { formatServicePrice, getServiceUnitPrice } from '../utils/servicePrice';

const ServiceCard = ({ service, currencySymbol, onOrder }) => {
  const sym = currencySymbol || '₹';
  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const platform = String(service.platform || '').trim();
  const category = String(service.category || '').trim();
  const minQty = Number(service.min_quantity);
  const maxQty = Number(service.max_quantity);
  const unitPrice = getServiceUnitPrice(service);

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
            {(platform || category) ? (
              <div className="services-card__meta-line">
                {platform ? <span className="services-card__meta-tag">{platform}</span> : null}
                {category ? <span className="services-card__meta-tag">{category}</span> : null}
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
              <span className="services-card__price">{sym}{formatServicePrice(service)}</span>
              <span className="services-card__price-unit">per 1000</span>
            </div>
            <button
              type="button"
              className="btn btn-primary services-card__order"
              onClick={() => onOrder({ ...service, price: unitPrice })}
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
