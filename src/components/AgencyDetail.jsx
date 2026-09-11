import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useMember } from '../context/MemberContext';
import { useLanguage } from '../context/LanguageContext';
import { ICONS } from '../constants/icons';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AgencyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { member, updateMember, markOrderPlaced } = useMember();
  const { t } = useLanguage();

  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemViewMode, setItemViewMode] = useState('cards'); // 'cards' or 'table'

  // Buy State
  const [buyingItem, setBuyingItem] = useState(null);
  const [buyMode, setBuyMode] = useState('box'); // 'box' or 'unit'
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [memberForm, setMemberForm] = useState({ name: '', shopName: '', phone: '' });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .getAgency(id)
      .then(setAgency)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-sync member details whenever member profile is available or changes
  useEffect(() => {
    if (member && (member.name || member.phone || member.shopName)) {
      setMemberForm({
        name: member.name || '',
        shopName: member.shopName || '',
        phone: member.phone || ''
      });
    }
  }, [member.name, member.shopName, member.phone]);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  }

  function handleOpenBuy(item) {
    setBuyingItem(item);
    setBuyMode('box');
    setBuyQuantity(1);
    setItemNotes('');
    setMemberForm({
      name: member.name || '',
      shopName: member.shopName || '',
      phone: member.phone || ''
    });
    setPurchaseError(null);
    setPurchaseSuccess(null);
  }

  function handleAddModalToCart() {
    if (!buyingItem) return;

    // Buyer mandatory fields validation
    if (!memberForm.name || !memberForm.name.trim()) {
      setPurchaseError(t('enterMemberNameError', 'Please enter Member / Name (Mandatory)'));
      return;
    }
    if (!memberForm.phone || !memberForm.phone.trim()) {
      setPurchaseError(t('enterPhoneError', 'Please enter Phone / WhatsApp Number (Mandatory)'));
      return;
    }

    // Automatically save & update Member profile with entered details
    updateMember({
      name: memberForm.name.trim(),
      shopName: (memberForm.shopName || '').trim(),
      phone: memberForm.phone.trim()
    });

    addToCart(buyingItem, buyQuantity, buyMode);
    const label = buyMode === 'unit' ? `${buyQuantity} pc${buyQuantity > 1 ? 's' : ''}` : `${buyQuantity} box${buyQuantity > 1 ? 'es' : ''}`;
    showToast(`Added ${label} of ${buyingItem.name} to Cart!`);
    setPurchaseError(null);
    setBuyingItem(null);
  }

  async function handleConfirmPurchase(e) {
    e.preventDefault();
    if (!buyingItem) return;
    if (buyQuantity < 1) {
      setPurchaseError('Please select at least 1 quantity');
      return;
    }

    if (!memberForm.name.trim()) {
      setPurchaseError('Please enter member / buyer name');
      return;
    }
    if (!memberForm.phone.trim()) {
      setPurchaseError('Please enter phone / WhatsApp number');
      return;
    }

    // Save member details for next time
    updateMember({
      name: memberForm.name.trim(),
      shopName: memberForm.shopName.trim(),
      phone: memberForm.phone.trim()
    });

    const unitsPerBox = buyingItem.unitsPerBox || 1;
    const maxAllowed = buyMode === 'unit'
      ? Math.floor(buyingItem.boxesInStock * unitsPerBox)
      : buyingItem.boxesInStock;

    if (buyQuantity > maxAllowed) {
      setPurchaseError(`Cannot buy more than ${maxAllowed} available ${buyMode === 'unit' ? 'pieces' : 'boxes'}`);
      return;
    }

    setIsPurchasing(true);
    setPurchaseError(null);
    try {
      const res = await api.buyItem(buyingItem._id, buyQuantity, buyMode, itemNotes, {
        name: memberForm.name.trim(),
        shopName: memberForm.shopName.trim(),
        phone: memberForm.phone.trim()
      });
      if (markOrderPlaced) markOrderPlaced();
      setPurchaseSuccess(res);

      // Update local state for immediate UI feedback
      setAgency((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items.map((it) =>
          it._id === buyingItem._id ? res.item : it
        );
        const newTotalBoxes = updatedItems.reduce((sum, i) => sum + i.boxesInStock, 0);
        return {
          ...prev,
          totalBoxes: newTotalBoxes,
          items: updatedItems
        };
      });
      // Keep buyingItem updated with latest stock
      setBuyingItem(res.item);
    } catch (err) {
      setPurchaseError(err.message);
    } finally {
      setIsPurchasing(false);
    }
  }

  if (loading) return <div className="state-msg">{t('loadingAgency', 'Loading agency…')}</div>;
  if (error) return <div className="state-msg error">Could not load agency: {error}</div>;
  if (!agency) return null;

  const lowCount = agency.items.filter((i) => i.status === 'low').length;
  const icon = ICONS[agency.iconKey] || ICONS.box;

  return (
    <main>
      <div className="breadcrumb">
        <span className="back" onClick={() => navigate('/')}>{t('backOverview', '← Overview')}</span> / {agency.name}
      </div>

      <section className="detail-hero">
        <div className="left">
          <div className="icon-box" style={{ background: agency.colorHex }}>{icon}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1>{agency.name}</h1>
            </div>
            <div className="meta">{agency.itemCount} {t('itemTypesCount', 'item types')} · {agency.category}</div>
          </div>
        </div>
        <div className="detail-stats">
          <div className="mini-stat"><div className="n">{agency.itemCount}</div><div className="l">{t('statItemTypes', 'Item types')}</div></div>
        </div>
      </section>

      <section className="item-table">
        <div className="item-table-head">
          <div>
            <h2>{t('itemsPricingTitle', 'Items & Wholesale Pricing')}</h2>
            <div className="subnote">{t('itemsPricingSubnote', 'Wholesale prices per box and per unit with instant ordering.')}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${itemViewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setItemViewMode('cards')}
                title="Card View"
              >
                ▦ {t('cardView', 'Cards')}
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${itemViewMode === 'table' ? 'active' : ''}`}
                onClick={() => setItemViewMode('table')}
                title="Table View"
              >
                ☰ {t('tableView', 'Table')}
              </button>
            </div>
          </div>
        </div>

        {agency.items.length === 0 ? (
          <div className="state-msg">{t('noItemsInAgency', 'No items added for this agency yet.')}</div>
        ) : (
          <>
            {/* Cards View: Always shown on mobile, or when itemViewMode is 'cards' on desktop */}
            <div className={`item-card-grid ${itemViewMode !== 'cards' ? 'desktop-hide-cards' : ''}`}>
              {agency.items.map((item) => {
                const pricePerBox = item.pricePerBox || 0;
                const pricePerUnit = item.pricePerUnit || (item.unitsPerBox ? (pricePerBox / item.unitsPerBox).toFixed(2) : 0);
                const isLow = item.status === 'low';
                const isOutOfStock = (item.boxesInStock || 0) <= 0;
                const pkgType = item.packagingType === 'bag' ? t('bag', 'bag') : t('box', 'box');

                return (
                  <div key={item._id} className="item-card">
                    <div>
                      <div className="item-card-top">
                        <div className="item-icon" style={{ background: agency.colorHex || '#F1E9D6' }}>
                          {icon}
                        </div>
                      </div>

                      <h3 className="item-card-title">{item.name}</h3>
                      {isOutOfStock && (
                        <div className="low-tag">
                          ● {t('outOfStock', 'Out of stock')}
                        </div>
                      )}

                      {/* Price Display */}
                      <div className="item-price-banner">
                        <div className="box-price-display">
                          <span className="cur">₹</span>
                          <span className="val">{pricePerBox.toLocaleString()}</span>
                          <span className="per">/{pkgType}</span>
                        </div>
                        <div className="unit-price-display">
                          ₹{pricePerUnit} /{t('unitPiece', 'unit')} ({item.unitsPerBox} {t('unitPieces', 'pcs')}/{pkgType})
                        </div>
                      </div>
                    </div>

                    <div className="item-card-footer" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className={`buy-action-btn ${isOutOfStock ? 'disabled' : ''}`}
                        disabled={isOutOfStock}
                        onClick={() => handleOpenBuy(item)}
                      >
                        {isOutOfStock ? t('outOfStock', 'Out of Stock') : `🛒 ${t('buy', 'Buy')}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table View: Only shown on desktop/tablets when Table view is active */}
            {itemViewMode === 'table' && (
              <table className="desktop-table-view">
                <thead>
                  <tr>
                    <th>{t('colItem', 'Item')}</th>
                    <th className="center">{t('colWholesaleRate', 'Wholesale Price')}</th>
                    <th className="right">{t('colAction', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {agency.items.map((item) => {
                    const pricePerBox = item.pricePerBox || 0;
                    const pricePerUnit = item.pricePerUnit || (item.unitsPerBox ? (pricePerBox / item.unitsPerBox).toFixed(2) : 0);
                    const isLow = item.status === 'low';
                    const isOutOfStock = (item.boxesInStock || 0) <= 0;
                    const pkgType = item.packagingType === 'bag' ? t('bag', 'bag') : t('box', 'box');

                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="item-name-cell">
                            <div className="item-icon">{icon}</div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{item.name}</div>
                              {isOutOfStock && (
                                <div className="low-tag">
                                  {t('outOfStock', 'Out of stock')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="center">
                          <div className="admin-price-cell">
                            <span className="box-price">₹{pricePerBox.toLocaleString()} <span className="unit-label">/{pkgType}</span></span>
                            <span className="per-pc-price">₹{pricePerUnit} /{t('unitPiece', 'pc')}</span>
                          </div>
                        </td>
                        <td className="right">
                          <button
                            type="button"
                            className={`buy-action-btn ${isOutOfStock ? 'disabled' : ''}`}
                            disabled={isOutOfStock}
                            onClick={() => handleOpenBuy(item)}
                          >
                            {isOutOfStock ? t('outOfStock', 'Out of Stock') : `🛒 ${t('buy', 'Buy')}`}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </section>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="floating-toast">
          <span className="toast-icon">✓</span>
          <span>{toastMessage}</span>
          <button
            type="button"
            className="toast-view-cart-btn"
            onClick={() => {
              setIsCartOpen(true);
              setToastMessage(null);
            }}
          >
            View Cart →
          </button>
        </div>
      )}

      {/* User Buy Modal */}
      {buyingItem && (
        <div className="modal-overlay" onClick={() => setBuyingItem(null)}>
          <div className="modal-dialog buy-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{t('quickWholesaleOrder', 'Quick Wholesale Order')}</h3>
                <p>{t('buySubtitle', 'Confirm your order quantity and buyer details below.')}</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setBuyingItem(null)}
              >
                ✕
              </button>
            </div>

            {purchaseSuccess ? (
              <div className="receipt-box">
                <div className="receipt-badge">{t('orderSuccessTitle', '✓ Order Confirmed & Logged!')}</div>
                <h4>{purchaseSuccess.message}</h4>
                <div className="receipt-card">
                  <div className="receipt-row">
                    <span>{t('colItem', 'Item')}:</span>
                    <strong>{buyingItem.name}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>{t('purchaseType', 'Purchase Type:')}</span>
                    <strong style={{ color: 'var(--indigo-deep)' }}>
                      {purchaseSuccess.buyType === 'unit'
                        ? `🔢 ${t('looseUnits', 'Loose Units / Pieces')}`
                        : buyingItem.packagingType === 'bag'
                        ? `🛍️ ${t('wholesaleBags', 'Wholesale Bags')}`
                        : `📦 ${t('wholesaleBoxes', 'Wholesale Boxes')}`}
                    </strong>
                  </div>
                  <div className="receipt-row">
                    <span>{t('qtyOrdered', 'Quantity Ordered:')}</span>
                    <strong>
                      {purchaseSuccess.buyType === 'unit'
                        ? `${purchaseSuccess.unitsBought} ${t('unitPieces', 'pieces')}`
                        : `${purchaseSuccess.boxesBought} ${buyingItem.packagingType === 'bag' ? (purchaseSuccess.boxesBought === 1 ? t('bag', 'bag') : t('bags', 'bags')) : (purchaseSuccess.boxesBought === 1 ? t('box', 'box') : t('boxes', 'boxes'))} (${purchaseSuccess.unitsBought} ${t('unitPieces', 'pcs')})`}
                    </strong>
                  </div>
                  <div className="receipt-row">
                    <span>{t('appliedRate', 'Applied Rate:')}</span>
                    <strong>
                      {purchaseSuccess.buyType === 'unit'
                        ? `₹${purchaseSuccess.pricePerUnit || purchaseSuccess.rate} /${t('unitPiece', 'piece')}`
                        : `₹${(purchaseSuccess.pricePerBox || 0).toLocaleString()} /${buyingItem.packagingType === 'bag' ? t('bag', 'bag') : t('box', 'box')}`}
                    </strong>
                  </div>

                  {purchaseSuccess.notes && (
                    <>
                      <div className="receipt-divider" />
                      <div className="receipt-notes-box">
                        <span className="notes-tag">{t('orderNotesLabel', 'Order Notes / Delivery Requests')}:</span>
                        <p className="notes-text">{purchaseSuccess.notes}</p>
                      </div>
                    </>
                  )}

                  <div className="receipt-divider" />
                  <div className="receipt-row total">
                    <span>{t('totalAmountPaid', 'Total Amount Paid:')}</span>
                    <strong className="receipt-total-amount">₹{(purchaseSuccess.totalAmount || 0).toLocaleString()}</strong>
                  </div>
                  <div className="receipt-row meta">
                    <span>{t('remainingStock', 'Remaining Stock:')}</span>
                    <span>{buyingItem.boxesInStock} {buyingItem.packagingType === 'bag' ? t('bags', 'bags') : t('boxes', 'boxes')} {t('inWarehouse', 'in warehouse')}</span>
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setBuyingItem(null)}
                  >
                    {t('done', 'Done')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmPurchase} className="buy-form">
                {(() => {
                  const pkgType = buyingItem.packagingType === 'bag' ? t('bag', 'bag') : t('box', 'box');
                  const PkgPlural = buyingItem.packagingType === 'bag' ? t('bags', 'bags') : t('boxes', 'boxes');
                  const unitsPerBox = buyingItem.unitsPerBox || 1;
                  const pricePerBox = buyingItem.pricePerBox || 0;
                  const pricePerUnit = buyingItem.pricePerUnit || (unitsPerBox ? Number((pricePerBox / unitsPerBox).toFixed(2)) : pricePerBox);
                  const maxUnits = Math.floor(buyingItem.boxesInStock * unitsPerBox);
                  const maxAllowed = buyMode === 'unit' ? maxUnits : buyingItem.boxesInStock;
                  const currentRate = buyMode === 'unit' ? pricePerUnit : pricePerBox;
                  const currentTotal = buyMode === 'unit' ? Number((buyQuantity * pricePerUnit).toFixed(2)) : (buyQuantity * pricePerBox);

                  return (
                    <>
                      <div className="buy-product-summary">
                        <div className="item-icon" style={{ background: agency.colorHex || '#F1E9D6', width: 44, height: 44 }}>
                          {icon}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '17px', margin: 0 }}>{buyingItem.name}</h4>
                          <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: 3 }}>
                            {agency.name} · {unitsPerBox} {t('unitPieces', 'pcs')}/{pkgType} · {t('colAvailable', 'Available Stock')}: <strong>{buyingItem.boxesInStock} {PkgPlural} ({maxUnits} {t('unitPieces', 'pcs')})</strong>
                          </div>
                        </div>
                      </div>

                      {/* Box vs Unit Mode Toggle */}
                      <div className="buy-mode-selector">
                        <div className="buy-mode-label">{t('selectHowToBuy', 'Select How You Want to Buy:')}</div>
                        <div className="buy-mode-pills">
                          <button
                            type="button"
                            className={`buy-mode-pill ${buyMode === 'box' ? 'active' : ''}`}
                            onClick={() => {
                              setBuyMode('box');
                              setBuyQuantity(1);
                            }}
                          >
                            <span className="pill-title">{buyingItem.packagingType === 'bag' ? `🛍️ ${t('buyByBag', 'Buy by Bag')}` : `📦 ${t('buyByBox', 'Buy by Box')}`}</span>
                            <span className="pill-subtitle">₹{pricePerBox.toLocaleString()} /{pkgType}</span>
                          </button>
                          <button
                            type="button"
                            className={`buy-mode-pill ${buyMode === 'unit' ? 'active' : ''}`}
                            onClick={() => {
                              setBuyMode('unit');
                              setBuyQuantity(1);
                            }}
                          >
                            <span className="pill-title">🔢 {t('buyByUnit', 'Buy Loose Units (Pieces)')}</span>
                            <span className="pill-subtitle">₹{pricePerUnit} /{t('unitPiece', 'piece')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="buy-qty-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontWeight: 600, fontSize: '14px' }}>
                            {t('quantityToOrder', 'Quantity to Order')} ({buyMode === 'box' ? PkgPlural : t('unitPieces', 'pieces')}):
                          </label>
                          <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                            Max: {maxAllowed} {buyMode === 'box' ? PkgPlural : t('unitPieces', 'pcs')}
                          </span>
                        </div>

                        <div className="buy-qty-controls">
                          <button
                            type="button"
                            className="qty-btn"
                            disabled={buyQuantity <= 1}
                            onClick={() => setBuyQuantity((prev) => Math.max(1, prev - 1))}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={maxAllowed}
                            value={buyQuantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val)) setBuyQuantity(1);
                              else setBuyQuantity(Math.min(maxAllowed, Math.max(1, val)));
                            }}
                            className="buy-qty-input"
                          />
                          <button
                            type="button"
                            className="qty-btn"
                            disabled={buyQuantity >= maxAllowed}
                            onClick={() => setBuyQuantity((prev) => Math.min(maxAllowed, prev + 1))}
                          >
                            +
                          </button>
                          <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                            {buyMode === 'box'
                              ? `= ${buyQuantity * unitsPerBox} ${t('unitPieces', 'pcs')}`
                              : `≈ ${(buyQuantity / unitsPerBox).toFixed(1)} ${PkgPlural}`}
                          </span>
                        </div>

                        {/* Quick increment chips for piece mode */}
                        {buyMode === 'unit' && maxUnits > 1 && (
                          <div className="quick-qty-chips">
                            <span>Quick set:</span>
                            {[1, 5, 10, unitsPerBox].filter(n => n <= maxUnits).map((n) => (
                              <button
                                key={n}
                                type="button"
                                className="quick-chip-btn"
                                onClick={() => setBuyQuantity(n)}
                              >
                                {n} {t('unitPieces', 'pcs')}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Member Info in Modal */}
                      <div className="buy-member-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <label style={{ fontWeight: 600, fontSize: '13px' }}>
                            👤 {t('buyerDetailsHeading', 'Buyer / Store Details')}:
                          </label>
                          {member.name && (
                            <button
                              type="button"
                              className="member-chip-btn"
                              onClick={() => {
                                setMemberForm({
                                  name: member.name || '',
                                  shopName: member.shopName || '',
                                  phone: member.phone || ''
                                });
                              }}
                            >
                              {t('autofillBtn', 'Autofill')}: {member.name}
                            </button>
                          )}
                        </div>

                        <div className="buy-member-fields-grid">
                          <div className="buy-field-group">
                            <label className="buy-field-label">{t('memberNameLbl', 'Member / Name *')}</label>
                            <input
                              type="text"
                              required
                              placeholder={t('buyerNamePlaceholder', 'Your Name (e.g. Ramesh)')}
                              className="styled-input-sm"
                              value={memberForm.name}
                              onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                            />
                          </div>

                          <div className="buy-field-group">
                            <label className="buy-field-label">{t('shopLbl', 'Shop / Business')}</label>
                            <input
                              type="text"
                              placeholder={t('shopNamePlaceholder', 'Shop Name (e.g. Kumar Store)')}
                              className="styled-input-sm"
                              value={memberForm.shopName}
                              onChange={(e) => setMemberForm({ ...memberForm, shopName: e.target.value })}
                            />
                          </div>

                          <div className="buy-field-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="buy-field-label">{t('phoneLbl', 'Phone / WhatsApp Number *')}</label>
                            <input
                              type="tel"
                              required
                              placeholder={t('phonePlaceholder', '10-digit mobile number')}
                              className="styled-input-sm"
                              value={memberForm.phone}
                              onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notes Input in Buy Modal */}
                      <div className="buy-notes-section">
                        <label htmlFor="modal-notes" style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                          📝 {t('orderNotesLabel', 'Order Notes / Delivery Requests (Optional)')}:
                        </label>
                        <textarea
                          id="modal-notes"
                          rows="2"
                          placeholder={t('orderNotesPlaceholder', 'e.g. Urgent morning dispatch, pack safely...')}
                          value={itemNotes}
                          onChange={(e) => setItemNotes(e.target.value)}
                          className="buy-notes-input"
                        />
                      </div>

                      {/* Breakdown */}
                      <div className="buy-amount-breakdown">
                        <div className="breakdown-line">
                          <span>{t('selectedRate', 'Selected Rate:')}</span>
                          <span>₹{currentRate.toLocaleString()} {buyMode === 'box' ? `/${pkgType}` : `/${t('unitPiece', 'piece')}`}</span>
                        </div>
                        <div className="breakdown-line">
                          <span>{t('qtyOrdered', 'Quantity Ordered:')}</span>
                          <span>{buyQuantity} {buyMode === 'box' ? PkgPlural : t('unitPieces', 'pieces')}</span>
                        </div>
                        <div className="breakdown-divider" />
                        <div className="breakdown-total">
                          <span>{t('totalPayable', 'Total Payable:')}</span>
                          <span className="total-highlight">₹{currentTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      {purchaseError && <div className="form-error" style={{ marginTop: '12px' }}>{purchaseError}</div>}

                      <div className="form-actions buy-modal-actions" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => setBuyingItem(null)}
                        >
                          {t('cancel', 'Cancel')}
                        </button>
                        <button
                          type="button"
                          className="primary-button add-cart-btn-modal"
                          disabled={maxAllowed <= 0}
                          onClick={handleAddModalToCart}
                          style={{ padding: '12px 24px', fontSize: '15px' }}
                        >
                          🛒 {t('addToCartBtn', 'Add to Cart')} (₹{currentTotal.toLocaleString()})
                        </button>
                      </div>
                    </>
                  );
                })()}
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
