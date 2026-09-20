import React from 'react';
import { Navigate } from 'react-router-dom';
import PublicServices from './PublicServices';
import Services from './Services';

/** Guests see marketing services page; logged-in users get the order catalog. */
const ServicesGate = () => {
  const token = localStorage.getItem('token');
  if (token) return <Services />;
  return <PublicServices />;
};

export default ServicesGate;
