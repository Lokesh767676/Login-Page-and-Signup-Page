import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import Logo from './Logo';

interface HeaderProps {
  onOpenModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenModal }) => {
  const { t } = useTranslation();

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
    <header>
      <nav>
        <div className="logo">
          <Logo />
          <div className="logo-text">AgriConnect</div>
        </div>
        
        <ul className="nav-links">
          <li><a href="#home" onClick={(e) => handleSmoothScroll(e, '#home')}>{t('header.home')}</a></li>
          <li><a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>{t('header.features')}</a></li>
          <li><a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>{t('header.about')}</a></li>
          <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>{t('header.contact')}</a></li>
        </ul>
        
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <button className="cta-btn" onClick={onOpenModal}>{t('header.getStarted')}</button>
        </div>
      </nav>
    </header>
  );
};

export default Header;