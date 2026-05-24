import React from 'react';
import BrandLogo from './BrandLogo';

const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className="app-loader">
    <div className="app-loader-inner">
      <BrandLogo size="lg" showText showSubtitle={false} />
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 16 }}>{message}</p>
    </div>
  </div>
);

export default LoadingScreen;
