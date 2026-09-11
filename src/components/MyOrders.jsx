import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useMember } from '../context/MemberContext';
import { useLanguage } from '../context/LanguageContext';

export default function MyOrders() {
  const navigate = useNavigate();
  const { member, setIsMemberModalOpen, setHasPlacedOrders } = useMember();
  const { t } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Self-service Order Recovery State (when order was placed with previous / wrong phone)
  const [showClaimBox, setShowClaimBox] = useState(false);
  const [claimInput, setClaimInput] = useState('');
  const [claimType, setClaimType] = useState('phone'); // 'phone' | 'orderId'
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMsg, setClaimMsg] = useState(null);

  const hasMemberProfile = Boolean(member && member.phone && member.phone.trim());

  // Whenever the active member profile changes or on load, fetch only their orders
  useEffect(() => {
    if (hasMemberProfile) {
      fetchOrders(member.phone.trim(), member.name ? member.name.trim() : '');
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [member?.phone, member?.name, hasMemberProfile]);

  function fetchOrders(phone, name) {
    if (!phone) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const params = { phone: phone.trim() };
    api.getOrders(params)
      .then((data) => {
        // Privacy guard: keep orders matching current member phone number
        const myOnly = Array.isArray(data) ? data.filter((ord) => {
          const ordPhone = (ord.customerPhone || '').trim();
          const curPhone = phone.trim();
          return ordPhone === curPhone;
        }) : [];
        setOrders(myOnly);
        if (setHasPlacedOrders) {
          setHasPlacedOrders(myOnly.length > 0);
          try {
            localStorage.setItem('karyana_member_has_orders_v1', String(myOnly.length > 0));
          } catch (e) {
            // ignore
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleClaimOrder(e) {
    e.preventDefault();
    if (!claimInput.trim()) {
      setClaimMsg({ type: 'error', text: 'Please enter a phone number or Order ID.' });
      return;
    }

    setClaimLoading(true);
    setClaimMsg(null);
    try {
      const payload = {
        newPhone: member.phone.trim(),
        customerName: member.name?.trim() || 'Member',
        shopName: member.shopName?.trim() || ''
      };

      if (claimType === 'orderId') {
        payload.orderId = claimInput.trim();
      } else {
        payload.oldPhone = claimInput.trim();
      }

      const res = await api.migrateOrders(payload);
      if (res.updatedCount > 0) {
        setClaimMsg({ type: 'success', text: `Success! Linked ${res.updatedCount} order(s) to your phone (${member.phone}).` });
        setClaimInput('');
        fetchOrders(member.phone.trim(), member.name ? member.name.trim() : '');
      } else {
        setClaimMsg({
          type: 'error',
          text: `No orders found matching "${claimInput.trim()}". Please double check the number or Order ID.`
        });
      }
    } catch (err) {
      setClaimMsg({ type: 'error', text: err.message || 'Failed to link orders' });
    } finally {
      setClaimLoading(false);
    }
  }

  const filteredOrders = orders.filter((ord) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ord.orderId.toLowerCase().includes(q) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
      (ord.shopName && ord.shopName.toLowerCase().includes(q)) ||
      ord.items.some((it) => it.name.toLowerCase().includes(q))
    );
  });

  return (
    <main className="orders-page">
      {/* Top Banner / Member Profile Header */}
      <section className="orders-hero">
        <div className="orders-hero-main">
          <div className="orders-avatar-box">📋</div>
          <div>
            <p className="eyebrow">{t('ordersHeroEyebrow', 'Customer & Member Portal')}</p>
            <h1>{t('ordersHeroTitle', 'My Wholesale Orders')}</h1>
            <div className="orders-member-info">
              {member.name ? (
                <div className="member-badge-active">
                  <span className="member-badge-pill name-pill">
                    👤 <strong>{member.name}</strong>
                  </span>
                  {member.shopName && (
                    <span className="member-badge-pill shop-pill">
                      🏪 {member.shopName}
                    </span>
                  )}
                  <span className="member-badge-pill phone-pill">
                    📞 {member.phone}
                  </span>
                  <button
                    type="button"
                    className="member-edit-pill-btn"
                    onClick={() => setIsMemberModalOpen(true)}
                  >
                    ✏️ {t('editProfile', 'Edit Profile')}
                  </button>
                </div>
              ) : (
                <div className="member-badge-guest">
                  <span>{t('guestMember', 'Guest Member')}</span>
                  <button
                    type="button"
                    className="primary-button-sm"
                    onClick={() => setIsMemberModalOpen(true)}
                  >
                    {t('setMemberProfile', 'Set Member Profile')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="orders-hero-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/')}
          >
            {t('backStorefront', '← Back to Storefront')}
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="section" style={{ paddingTop: 28 }}>
        {!hasMemberProfile ? (
          /* Locked / Profile Required state for guest users to protect member privacy */
          <div className="state-msg empty-orders-state" style={{ maxWidth: 640, margin: '20px auto', padding: '40px 24px', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 8, color: 'var(--ink)' }}>
              {t('profileRequiredTitle', 'Profile Required to View Orders')}
            </h3>
            <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 500, margin: '0 auto 20px' }}>
              {t('profileRequiredDesc', 'Please set up or log in to your Member Profile to view your past wholesale orders. Orders placed by other members are kept private.')}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="primary-button"
                onClick={() => setIsMemberModalOpen(true)}
              >
                👤 {t('createProfileBtn', 'Create Member Profile')}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate('/')}
              >
                {t('browseProductsBtn', 'Browse Products & Order')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="orders-controls-card">
              {/* Member Profile Quick Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #E8EDF8, #D6E2FA)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  color: 'var(--indigo-deep)',
                  boxShadow: '0 2px 8px rgba(43, 58, 103, 0.08)',
                  flexShrink: 0
                }}>
                  👤
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--indigo-deep)' }}>
                      {member.name}
                    </span>
                    {member.shopName && (
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--indigo)',
                        background: 'rgba(43, 58, 103, 0.08)',
                        padding: '2px 8px',
                        borderRadius: 6,
                        border: '1px solid rgba(43, 58, 103, 0.12)'
                      }}>
                        🏪 {member.shopName}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📞 <strong>{member.phone}</strong></span>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <span style={{ fontSize: 12 }}>{t('ordersHeroEyebrow', 'Customer & Member Portal')}</span>
                  </div>
                </div>
              </div>

              {/* Order Search Bar */}
              <div className="search-order-wrap">
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo-deep)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>🔍</span> {t('searchInResults', 'Search in Results:')}
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder', 'Search by Order ID or Product...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="styled-input search-orders-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--ink-soft)',
                        fontSize: 14,
                        cursor: 'pointer',
                        padding: 4
                      }}
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Orders List / State for this Member */}
            {loading ? (
              <div className="state-msg">{t('loadingOrders', 'Loading orders…')}</div>
            ) : error ? (
              <div className="state-msg error">Could not load orders: {error}</div>
            ) : filteredOrders.length === 0 ? (
              <div className="state-msg empty-orders-state" style={{ maxWidth: 650, margin: '20px auto', padding: '32px 24px' }}>
                <div style={{ fontSize: 38, marginBottom: 12 }}>📦</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>{t('noOrdersFound', 'No Wholesale Orders Found')}</h3>
                <p style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>
                  {t('noOrdersSub', "You haven't placed any orders yet with phone number:")} <strong>{member.phone}</strong>
                </p>

                {/* Self-Service Missing Order Recovery Tool */}
                <div style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '20px',
                  textAlign: 'left',
                  margin: '18px 0 24px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 700, color: 'var(--indigo-deep)' }}>
                    <span>🔍</span>
                    <span>Placed an order with a typo / wrong phone number?</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 14px', lineHeight: 1.5 }}>
                    If you entered an incorrect phone number during checkout, enter the <strong>Order ID</strong> (e.g. <code>ORD-123456</code>) or the <strong>Previous/Wrong Phone Number</strong> below to link it to your profile:
                  </p>

                  <form onSubmit={handleClaimOrder} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="claimType"
                          value="phone"
                          checked={claimType === 'phone'}
                          onChange={() => setClaimType('phone')}
                        />
                        Previous / Wrong Phone
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="claimType"
                          value="orderId"
                          checked={claimType === 'orderId'}
                          onChange={() => setClaimType('orderId')}
                        />
                        Order ID (e.g. ORD-123456)
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        required
                        placeholder={claimType === 'orderId' ? 'Enter Order ID (e.g. ORD-123456)' : 'Enter previous/wrong phone number'}
                        value={claimInput}
                        onChange={(e) => setClaimInput(e.target.value)}
                        className="styled-input"
                        style={{ flex: '1 1 220px' }}
                      />
                      <button
                        type="submit"
                        disabled={claimLoading}
                        className="primary-button"
                        style={{ padding: '9px 18px', whiteSpace: 'nowrap' }}
                      >
                        {claimLoading ? 'Linking…' : '🔗 Link to My Profile'}
                      </button>
                    </div>

                    {claimMsg && (
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        fontSize: 13,
                        background: claimMsg.type === 'success' ? '#E8F5E9' : '#FFEBEE',
                        color: claimMsg.type === 'success' ? '#2E7D32' : '#C62828'
                      }}>
                        {claimMsg.text}
                      </div>
                    )}
                  </form>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate('/')}
                >
                  {t('browseProductsBtn', 'Browse Products & Order')}
                </button>
              </div>
            ) : (
          <div className="orders-list">
            {/* Quick Link More Orders option header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div className="orders-count-heading" style={{ margin: 0 }}>
                Showing <strong>{filteredOrders.length}</strong> {filteredOrders.length === 1 ? t('showingOrders', 'wholesale order') : t('showingOrdersPlural', 'wholesale orders')}:
              </div>
              <button
                type="button"
                className="member-edit-link"
                style={{ fontSize: 13, padding: '4px 8px' }}
                onClick={() => setShowClaimBox(!showClaimBox)}
              >
                {showClaimBox ? '✕ Close Order Finder' : '🔍 Find Missing Order by ID / Old Phone'}
              </button>
            </div>

            {showClaimBox && (
              <div style={{
                background: 'var(--paper)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '16px',
                marginBottom: 20,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6, color: 'var(--indigo-deep)' }}>
                  Link past order placed with previous phone number or order ID:
                </div>
                <form onSubmit={handleClaimOrder} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    className="admin-select"
                    style={{ padding: '8px 10px', fontSize: 13 }}
                  >
                    <option value="phone">Previous Phone Number</option>
                    <option value="orderId">Order ID</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder={claimType === 'orderId' ? 'e.g. ORD-123456' : 'e.g. 9876543210'}
                    value={claimInput}
                    onChange={(e) => setClaimInput(e.target.value)}
                    className="styled-input"
                    style={{ flex: '1 1 200px', padding: '8px 12px' }}
                  />
                  <button
                    type="submit"
                    disabled={claimLoading}
                    className="primary-button"
                    style={{ padding: '8px 16px', fontSize: 13 }}
                  >
                    {claimLoading ? 'Linking…' : '🔗 Link to My Account'}
                  </button>
                </form>
                {claimMsg && (
                  <div style={{
                    marginTop: 10,
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 12.5,
                    background: claimMsg.type === 'success' ? '#E8F5E9' : '#FFEBEE',
                    color: claimMsg.type === 'success' ? '#2E7D32' : '#C62828'
                  }}>
                    {claimMsg.text}
                  </div>
                )}
              </div>
            )}

            {filteredOrders.map((order) => {
              const statusColors = {
                confirmed: { bg: '#E3F2FD', color: '#1565C0', label: t('statusConfirmed', '✓ Confirmed') },
                dispatched: { bg: '#FFF8E1', color: '#F57F17', label: t('statusDispatched', '🚚 Dispatched') },
                delivered: { bg: '#E8F5E9', color: '#2E7D32', label: t('statusDelivered', '★ Delivered') },
                cancelled: { bg: '#FFEBEE', color: '#C62828', label: t('statusCancelled', '✕ Cancelled') }
              };
              const st = statusColors[order.status] || statusColors.confirmed;

              return (
                <div key={order._id || order.orderId} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <div className="order-id-row">
                        <span className="order-ref">{order.orderId}</span>
                        <span
                          className="order-status-pill"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="order-date-text">
                        {t('placedOn', 'Placed on')} {new Date(order.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <div className="order-buyer-tag">
                      <div className="buyer-name">{order.customerName || t('navMember', 'Customer')}</div>
                      {order.shopName && <div className="buyer-shop">{order.shopName}</div>}
                      {order.customerPhone && <div className="buyer-phone">📞 {order.customerPhone}</div>}
                    </div>
                  </div>

                  {/* Itemized list */}
                  <div className="order-items-table">
                    <div className="order-items-header">
                      <span>{t('itemDescription', 'Item Description')}</span>
                      <span style={{ textAlign: 'center' }}>{t('rate', 'Rate')}</span>
                      <span style={{ textAlign: 'center' }}>{t('qty', 'Quantity')}</span>
                      <span style={{ textAlign: 'right' }}>{t('subtotal', 'Subtotal')}</span>
                    </div>

                    {order.items && order.items.map((it, idx) => {
                      const pkg = it.packagingType === 'bag' ? t('bag', 'bag') : t('box', 'box');
                      const pkgPlural = it.packagingType === 'bag' ? (it.boxesBought === 1 ? t('bag', 'bag') : t('bags', 'bags')) : (it.boxesBought === 1 ? t('box', 'box') : t('boxes', 'boxes'));

                      return (
                        <div key={idx} className="order-item-row">
                          <div className="order-item-info">
                            <div className="item-title">{it.name}</div>
                            <div className="item-agency">{it.agencyName}</div>
                          </div>

                          <div className="order-item-meta">
                            <div className="order-item-rate">
                              ₹{it.rate ? it.rate.toLocaleString() : 0} {it.buyType === 'unit' ? `/${t('unitPiece', 'pc')}` : `/${pkg}`}
                            </div>

                            <div className="order-item-qty">
                              {it.buyType === 'unit' ? (
                                <span className="qty-tag-unit">{it.unitsBought} {t('unitPieces', 'pieces')}</span>
                              ) : (
                                <span className="qty-tag-box">
                                  {it.boxesBought} {pkgPlural} {it.unitsBought ? `(${it.unitsBought} ${t('unitPieces', 'pcs')})` : ''}
                                </span>
                              )}
                            </div>

                            <div className="order-item-subtotal">
                              ₹{(it.subtotal || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Notes & Summary Footer */}
                  <div className="order-card-footer">
                    <div className="order-footer-notes">
                      {order.notes ? (
                        <div className="receipt-notes-box" style={{ margin: 0 }}>
                          <span className="notes-tag">{t('orderNotesLabel', 'Member Notes / Instructions')}:</span>
                          <p className="notes-text">{order.notes}</p>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                          -
                        </span>
                      )}
                    </div>

                    <div className="order-footer-total">
                      <div className="total-label">{t('grandTotal', 'Grand Total:')}</div>
                      <div className="total-price">₹{(order.grandTotal || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
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
          <span>{t('footerSub', 'Member Order Management & Real-time Stock')}</span>
        </div>
      </footer>
    </main>
  );
}
