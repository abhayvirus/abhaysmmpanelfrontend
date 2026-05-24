import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#070b12',
        color: '#e8edf5',
      }}>
        <div className="card" style={{ maxWidth: 480 }}>
          <h1 style={{ marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: '#8b9cb3', marginBottom: 16, fontSize: 14 }}>
            {error.message || 'The page failed to load.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
