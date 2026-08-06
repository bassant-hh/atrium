import React from 'react';
import Navbar from '../../components/landing/Navbar/Navbar';
import Hero from '../../components/landing/Hero/Hero';
import Services from '../../components/landing/Services/Services';
import HowItWorks from '../../components/landing/HowItWorks/HowItWorks';
import FeatureGrid from '../../components/landing/FeatureGrid/FeatureGrid';
import CTA from '../../components/landing/CTA/CTA';
import Footer from '../../components/landing/Footer/Footer';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <Services />
      <HowItWorks />
      <FeatureGrid />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
