import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/themes.css';
import './index.css';
import './styles/responsive.css';
import './styles/floatingWidgets.css';
import './styles/userPanelMobile.css';
import './styles/adminMobile.css';
import './styles/adminOrders.css';
import './styles/adminChat.css';
import './styles/adminSettings.css';
import './styles/addFunds.css';
import './styles/profilePage.css';
import './styles/websiteDevPage.css';
import './styles/adminWebsiteDev.css';
import './styles/adminCategories.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);