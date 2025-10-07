import React from 'react';
import { useTranslation } from 'react-i18next';

interface HeroProps {
  onOpenModal: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenModal }) => {
  const { t } = useTranslation();

  const handleDiscoverFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector('#features');
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <h1>{t('hero.title')}</h1>
        <p>{t('hero.subtitle')}</p>
        <div className="hero-buttons">
          <a href="#features" className="btn-primary" onClick={handleDiscoverFeatures}>
            {t('hero.discoverFeatures')}
          </a>
          <button className="btn-secondary" onClick={onOpenModal}>
            {t('hero.joinNow')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;