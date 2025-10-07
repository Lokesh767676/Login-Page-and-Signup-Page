import React from 'react';

interface FooterProps {
  onOpenModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <footer id="contact">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>AgriConnect</h3>
            <p>Empowering farmers and agricultural workers through innovative technology solutions for a sustainable future.</p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <p><a href="#home" onClick={(e) => handleSmoothScroll(e, '#home')}>Home</a></p>
            <p><a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>Features</a></p>
            <p><a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>About Us</a></p>
            <p><button type="button" onClick={onOpenModal} style={{ background: 'none', border: 'none', color: '#bdc3c7', textDecoration: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Login/Signup</button></p>
          </div>
          
          <div className="footer-section">
            <h3>Services</h3>
            <p><a href="#">Farmer-Labour Connection</a></p>
            <p><a href="#">Price Predictions</a></p>
            <p><a href="#">Smart Farming Tools</a></p>
            <p><a href="#">Market Analytics</a></p>
          </div>
          
          <div className="footer-section">
            <h3>Contact Info</h3>
            <p>Email: support@agriconnect.com</p>
            <p>Phone: +91 9876543210</p>
            <p>Address: Agricultural Hub, Green Valley, India</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 AgriConnect. All rights reserved. Building sustainable agricultural communities.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;