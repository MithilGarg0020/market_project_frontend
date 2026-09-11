import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { ICONS } from '../constants/icons';

export default function Overview() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    api
      .getAgencies()
      .then(setAgencies)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalAgencies = agencies.length;
  const totalItemTypes = agencies.reduce((sum, a) => sum + (a.itemCount || 0), 0);
  const totalBoxes = agencies.reduce((sum, a) => sum + (a.totalBoxes || 0), 0);

  if (loading) return <div className="state-msg">{t('loadingAgencies', 'Loading agencies…')}</div>;
  if (error) return <div className="state-msg error">Could not load agencies: {error}</div>;

  return (
    <main>
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">{t('heroEyebrow', 'Warehouse stock, at a glance')}</p>
          <h1>{t('heroTitle', 'Agency-wise box stock for the store')}</h1>
          <p>
            {t('heroDesc', "A live view of how many boxes of each agency's goods are currently in the store, with wholesale prices, box and price details, and instant box ordering available.")}
          </p>
        </div>
        <div className="hero-stats">
          <div className="cell"><div className="n">{totalAgencies}</div><div className="l">{t('statAgencies', 'Agencies')}</div></div>
          <div className="cell"><div className="n">{totalItemTypes}</div><div className="l">{t('statItemTypes', 'Item types')}</div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>{t('agenciesTitle', 'Agencies in store')}</h2>
            <div className="note">{t('agenciesNote', 'Click any agency to view item-wise stock, wholesale prices, and order items')}</div>
          </div>
        </div>

        {agencies.length === 0 ? (
          <div className="state-msg">
            {t('noAgencies', 'No agencies yet. Run npm run seed in the backend to load sample data.')}
          </div>
        ) : (
          <div className="agency-grid">
            {agencies.map((agency) => (
              <div
                key={agency._id}
                className="agency-card"
                onClick={() => navigate(`/agency/${agency._id}`)}
              >
                <div className="top-row">
                  <div className="icon-box" style={{ background: agency.colorHex }}>
                    {ICONS[agency.iconKey] || ICONS.box}
                  </div>
                </div>
                <h3>{agency.name}</h3>
                <div className="cat">{agency.itemCount} {t('itemTypesCount', 'item types')} · {agency.category}</div>
                <div className="agency-card-footer">
                  <span className="view-link">{t('viewStockLink', 'View stock & order items →')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="site">
        <div className="footer-left">
          <span className="footer-store-name">{t('footerStore', 'Sanjeev Karyana Wholesale Store')}</span>
          <div className="footer-contact-info">
            <a href="tel:9855734450" className="footer-contact-link">
              {t('footerPhone', '📞 +91 98557 34450')}
            </a>
            <span className="footer-sep">·</span>
            <span className="footer-address-text">{t('footerAddress', '📍 M.k road near sugar mill dhuri')}</span>
          </div>
        </div>
        <div className="footer-right">
          <span>{t('footerSub', 'Wholesale stock tracking & inventory ordering')}</span>
        </div>
      </footer>
    </main>
  );
}
