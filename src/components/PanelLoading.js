import React from 'react';

const PanelLoading = ({ message = 'Loading…' }) => (
  <div className="panel-loading" role="status" aria-live="polite">
    <div className="panel-loading-spinner" aria-hidden="true" />
    <p>{message}</p>
  </div>
);

export default PanelLoading;
