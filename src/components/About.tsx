import React from 'react';
import { useTranslation } from 'react-i18next';

interface AboutProps {
  onOpenModal: () => void;
}

const About: React.FC<AboutProps> = ({ onOpenModal }) => {
  const { t } = useTranslation();

  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h2>{t('about.title')}</h2>
            <p>{t('about.description1')}</p>
            <p>{t('about.description2')}</p>
            <button className="btn-primary" onClick={onOpenModal}>
              {t('about.joinCommunity')}
            </button>
          </div>
          <div className="about-image">
            <img 
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80" 
              alt="Modern Agriculture"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;