import React from 'react';

/** Decorative ABHAY brand watermark — visible but non-interactive */
const LandingWatermark = () => (
  <div className="landing-watermark" aria-hidden="true">
    <span className="landing-watermark__text landing-watermark__text--primary">ABHAY</span>
    <span className="landing-watermark__text landing-watermark__text--secondary">ABHAY</span>
  </div>
);

export default LandingWatermark;
