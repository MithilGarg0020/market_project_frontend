import { useState, useEffect } from 'react';
import { useMember } from '../context/MemberContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

export default function MemberModal() {
  const { member, updateMember, clearMember, isMemberModalOpen, setIsMemberModalOpen } = useMember();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    phone: ''
  });
  const [error, setError] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(null);

  useEffect(() => {
    if (isMemberModalOpen) {
      setFormData({
        name: member.name || '',
        shopName: member.shopName || '',
        phone: member.phone || ''
      });
      setError(null);
      setClearSuccess(null);
    }
  }, [isMemberModalOpen, member]);

  if (!isMemberModalOpen) return null;

  function handleDeleteProfile() {
    if (window.confirm(`Are you sure you want to delete profile "${member.name || 'Member'}" from this device?`)) {
      clearMember();
      setFormData({ name: '', shopName: '', phone: '' });
      setIsMemberModalOpen(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone or WhatsApp number');
      return;
    }

    const cleanName = formData.name.trim();
    const cleanShop = formData.shopName.trim();
    const cleanPhone = formData.phone.trim();
    const oldPhone = (member.phone || '').trim();

    const payload = {
      name: cleanName,
      shopName: cleanShop,
      phone: cleanPhone,
      oldPhone: oldPhone || undefined
    };

    // If phone number changed and old phone existed, automatically migrate past orders
    if (oldPhone && oldPhone !== cleanPhone) {
      try {
        await api.migrateOrders({
          oldPhone,
          newPhone: cleanPhone,
          customerName: cleanName,
          shopName: cleanShop
        });
      } catch (migrateErr) {
        console.warn('Orders migration notice:', migrateErr.message);
      }
    }

    updateMember(payload);

    // Save to backend database so Admin can view member profile
    try {
      await api.saveMember(payload);
    } catch (err) {
      console.warn('Backend member sync notice:', err.message);
    }

    setIsMemberModalOpen(false);
  }

  return (
    <div className="modal-overlay" onClick={() => setIsMemberModalOpen(false)}>
      <div className="modal-content member-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="member-avatar-badge">👤</div>
            <div>
              <h3>{t('memberModalTitle', 'Customer / Member Profile')}</h3>
              <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                {t('memberModalSub', 'Set your details once to easily order wholesale anytime and track your orders.')}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsMemberModalOpen(false)}
          >
            ✕
          </button>
        </div>

        {error && <div className="state-msg error" style={{ margin: '14px 0 0' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="member-form" style={{ marginTop: '16px' }}>
          <div className="form-group">
            <label>{t('buyerNameStar', 'Member / Buyer Name *')}</label>
            <input
              type="text"
              required
              placeholder={t('buyerNamePlaceholder', 'e.g. Ramesh Kumar')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="styled-input"
            />
          </div>

          <div className="form-group">
            <label>{t('shopNameOpt', 'Shop / Business Name (Optional)')}</label>
            <input
              type="text"
              placeholder={t('shopNamePlaceholder', 'e.g. Kumar Provision Store')}
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="styled-input"
            />
          </div>

          <div className="form-group">
            <label>{t('mobileStar', 'Mobile / WhatsApp Number *')}</label>
            <input
              type="tel"
              required
              placeholder={t('phonePlaceholder', 'e.g. 9876543210')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="styled-input"
            />
            <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)', marginTop: 4, display: 'block' }}>
              {t('mobileHelpText', 'Used to find your past order receipts and delivery updates.')}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
            <div>
              {(member.name || member.phone) && (
                <button
                  type="button"
                  className="clear-history-btn"
                  onClick={handleDeleteProfile}
                  title={t('deleteProfile', 'Delete saved member profile')}
                >
                  🗑️ {t('deleteProfile', 'Delete Profile')}
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                type="button"
                className="secondary-button"
                style={{ padding: '11px 22px', borderRadius: '10px' }}
                onClick={() => setIsMemberModalOpen(false)}
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="primary-button"
                style={{ padding: '11px 22px', borderRadius: '10px' }}
              >
                {(member.name || member.phone)
                  ? t('editMemberDetails', 'Edit Member Details')
                  : t('saveProfile', 'Save Member Profile')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
