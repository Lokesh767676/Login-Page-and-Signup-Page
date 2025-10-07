import React from 'react';
import { useTranslation } from 'react-i18next';

const Features: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: '🤝',
      title: t('features.connect.title'),
      description: t('features.connect.description')
    },
    {
      icon: '📊',
      title: t('features.prices.title'),
      description: t('features.prices.description')
    },
    {
      icon: '🌱',
      title: t('features.tools.title'),
      description: t('features.tools.description')
    }
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-title">
          <h2>{t('features.title')}</h2>
          <p>{t('features.subtitle')}</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;