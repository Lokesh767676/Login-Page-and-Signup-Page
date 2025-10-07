import React from 'react';
import { useTranslation } from 'react-i18next';

const Stats: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { number: '5000+', label: t('stats.farmers') },
    { number: '12000+', label: t('stats.workers') },
    { number: '95%', label: t('stats.accuracy') },
    { number: '200+', label: t('stats.crops') }
  ];

  return (
    <section className="stats">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <h3>{stat.number}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;