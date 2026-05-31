import React from 'react';

/** Site-wide low-opacity ABHAY watermark — decorative only */
const LandingWatermark = () => (
  <div className="landing-watermark" aria-hidden="true">
    <span className="landing-watermark__text">ABHAY</span>
    <span className="landing-watermark__text landing-watermark__text--offset">ABHAY</span>
  </div>
);

export default LandingWatermark;
