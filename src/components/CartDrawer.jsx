import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useMember } from '../context/MemberContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

export default function CartDrawer({ onOrderSuccess }) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    orderReceipt,
    setOrderReceipt
  } = useCart();

  const { member, updateMember, setIsMemberModalOpen, markOrderPlaced } = useMember();
  const { t } = useLanguage();

  const [notes, setNotes] = useState('');
  const [buyerName, setBuyerName] = useState(member.name || '');
  const [buyerShop, setBuyerShop] = useState(member.shopName || '');
  const [buyerPhone, setBuyerPhone] = useState(member.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // Keep fields synced with member profile whenever modal or profile updates
  useEffect(() => {
    if (member.name || member.phone || member.shopName) {
      setBuyerName(member.name || '');
      setBuyerShop(member.shopName || '');
      setBuyerPhone(member.phone || '');
    }
  }, [member.name, member.phone, member.shopName, isCartOpen]);

  if (!isCartOpen) return null;

  async function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!buyerName.trim()) {
      setCheckoutError('Please enter member / buyer name');
      return;
    }
    if (!buyerPhone.trim()) {
      setCheckoutError('Please enter contact / WhatsApp phone number');
      return;
    }

    // Save profile to context for next time
    updateMember({
      name: buyerName.trim(),
      shopName: buyerShop.trim(),
      phone: buyerPhone.trim()
    });

    setIsSubmitting(true);
    setCheckoutError(null);
    try {
      const payload = cart.map((entry) => ({
        itemId: entry.item._id,
        buyType: entry.buyType || 'box',
        quantity: entry.quantity,
        boxes: entry.buyType === 'box' ? entry.quantity : undefined,
        units: entry.buyType === 'unit' ? entry.quantity : undefined
      }));

      const res = await api.checkoutCart(payload, notes, {
        name: buyerName.trim(),
        shopName: buyerShop.trim(),
        phone: buyerPhone.trim()
      });
      if (markOrderPlaced) markOrderPlaced();
      setOrderReceipt(res);
      clearCart();
      setNotes('');
      if (onOrderSuccess) onOrderSuccess(res);
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setIsCartOpen(false);
    setCheckoutError(null);
  }

  function handleDoneReceipt() {
    setOrderReceipt(null);
    setIsCartOpen(false);
  }

  return (
    <div className="modal-overlay cart-drawer-overlay" onClick={handleClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <h3>🛒 {t('cartTitle', 'Wholesale Cart')}</h3>
            <span className="cart-count-badge">
              {cartCount} {t('unitPieces', 'items')}
            </span>
          </div>
          <button type="button" className="cart-close-btn" onClick={handleClose} title={t('close', 'Close cart')}>
            ✕
          </button>
        </div>

        {/* Order Receipt View */}
        {orderReceipt ? (
          <div className="cart-body">
            <div className="receipt-box" style={{ padding: '10px 0' }}>
              <div className="receipt-badge">{t('orderSuccessTitle', '✓ ORDER CONFIRMED')}</div>
              <h4 style={{ fontSize: '18px', margin: '8px 0 16px' }}>{orderReceipt.message}</h4>

              <div className="receipt-card">
                <div className="receipt-row">
                  <span>{t('orderRef', 'Order Reference:')}</span>
                  <strong>{orderReceipt.orderId}</strong>
                </div>
                <div className="receipt-row">
                  <span>{t('dateTime', 'Date & Time:')}</span>
                  <span>{new Date(orderReceipt.purchaseDate).toLocaleString('en-GB')}</span>
                </div>

                <div className="receipt-divider" />

                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 4 }}>
                  {t('purchasedItems', 'PURCHASED ITEMS')} ({orderReceipt.items.length}):
                </div>
                {orderReceipt.items.map((it, idx) => {
                  const pkg = it.packagingType === 'bag' ? t('bag', 'bag') : t('box', 'box');
                  const pkgPlural = it.packagingType === 'bag' ? (it.boxesBought === 1 ? t('bag', 'bag') : t('bags', 'bags')) : (it.boxesBought === 1 ? t('box', 'box') : t('boxes', 'boxes'));
                  return (
                    <div key={idx} className="receipt-item-line">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{it.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                          {it.buyType === 'unit'
                            ? `${it.unitsBought} ${t('unitPieces', 'pieces')} × ₹${it.rate} /${t('unitPiece', 'pc')}`
                            : `${it.boxesBought} ${pkgPlural} (${it.unitsBought} ${t('unitPieces', 'pcs')}) × ₹${it.rate.toLocaleString()} /${pkg}`}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>
                        ₹{it.subtotal.toLocaleString()}
                      </div>
                    </div>
                  );
                })}

                <div className="receipt-divider" />

                {orderReceipt.notes && (
                  <div className="receipt-notes-box">
                    <span className="notes-tag">{t('orderNotesLabel', 'Order Notes / Instructions')}:</span>
                    <p className="notes-text">{orderReceipt.notes}</p>
                  </div>
                )}

                <div className="receipt-row total" style={{ marginTop: '8px' }}>
                  <span>{t('grandTotalPaid', 'Grand Total Paid:')}</span>
                  <strong className="receipt-total-amount">
                    ₹{orderReceipt.grandTotal.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="primary-button"
                  style={{ width: '100%', padding: '12px' }}
                  onClick={handleDoneReceipt}
                >
                  {t('continueShopping', 'Continue Shopping')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Cart Items View */
          <>
            <div className="cart-body">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="cart-empty-icon">📦</div>
                  <h4>{t('cartEmptyTitle', 'Your Cart is Empty')}</h4>
                  <p>{t('cartEmptySub', 'Add wholesale boxes or individual pieces from any agency catalog.')}</p>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.map((entry) => {
                    const item = entry.item;
                    const isUnit = entry.buyType === 'unit';
                    const unitsPerBox = item.unitsPerBox || 1;
                    const pricePerBox = item.pricePerBox || 0;
                    const pricePerUnit = item.pricePerUnit || Number((pricePerBox / unitsPerBox).toFixed(2));
                    const rate = isUnit ? pricePerUnit : pricePerBox;
                    const subtotal = Number((entry.quantity * rate).toFixed(2));

                    const maxStock = isUnit
                      ? Math.floor((item.boxesInStock || 0) * unitsPerBox)
                      : (item.boxesInStock || 0);
                    const isAtMax = entry.quantity >= maxStock;
                    const pkgType = item.packagingType === 'bag' ? t('bag', 'bag') : t('box', 'box');
                    const pkgPlural = item.packagingType === 'bag' ? t('bags', 'bags') : t('boxes', 'boxes');

                    return (
                      <div key={entry.cartId} className="cart-item-row">
                        <div className="cart-item-info">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div className="cart-item-name">{item.name}</div>
                            <span className={`cart-type-badge ${isUnit ? 'unit-badge' : 'box-badge-tag'}`}>
                              {isUnit ? `🔢 ${t('looseUnitBadge', 'Loose Unit')}` : item.packagingType === 'bag' ? `🛍️ ${t('wholesaleBagBadge', 'Wholesale Bag')}` : `📦 ${t('fullBoxBadge', 'Full Box')}`}
                            </span>
                          </div>
                          <div className="cart-item-agency">
                            {item.agency?.name || 'Wholesale Supplier'} · {unitsPerBox} {t('unitPieces', 'pcs')}/{pkgType}
                          </div>
                          <div className="cart-item-rate">
                            ₹{rate.toLocaleString()} <span className="rate-unit">{isUnit ? `/${t('unitPiece', 'piece')}` : `/${pkgType}`}</span>
                          </div>
                        </div>

                        <div className="cart-item-actions">
                          <div className="cart-stepper">
                            <button
                              type="button"
                              className="cart-step-btn"
                              onClick={() => updateQuantity(entry.cartId, entry.quantity - 1)}
                              title={`Decrease ${isUnit ? t('unitPieces', 'pieces') : pkgPlural}`}
                            >
                              −
                            </button>
                            <span className="cart-step-val">{entry.quantity}</span>
                            <button
                              type="button"
                              className="cart-step-btn"
                              disabled={isAtMax}
                              onClick={() => updateQuantity(entry.cartId, entry.quantity + 1)}
                              title={isAtMax ? 'Reached max available stock' : `Increase ${isUnit ? t('unitPieces', 'pieces') : pkgPlural}`}
                            >
                              +
                            </button>
                          </div>

                          <div className="cart-item-subtotal">
                            ₹{subtotal.toLocaleString()}
                          </div>

                          <button
                            type="button"
                            className="cart-remove-btn"
                            onClick={() => removeFromCart(entry.cartId)}
                            title={t('delete', 'Remove item')}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Member / Buyer Details Section */}
              {cart.length > 0 && (
                <div className="cart-buyer-card">
                  <div className="cart-buyer-header">
                    <span>👤 {t('buyerInfoTitle', 'Member / Buyer Information:')}</span>
                    {member.name && (
                      <button
                        type="button"
                        className="member-chip-btn"
                        onClick={() => {
                          setBuyerName(member.name || '');
                          setBuyerShop(member.shopName || '');
                          setBuyerPhone(member.phone || '');
                        }}
                        title="Fill from saved profile"
                      >
                        {t('autofillBtn', 'Autofill')}: {member.name}
                      </button>
                    )}
                  </div>

                  <div className="cart-buyer-inputs">
                    <div>
                      <label className="cart-input-lbl">{t('memberNameLbl', 'Member / Name *')}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('buyerNamePlaceholder', 'Your Name (e.g. Ramesh)')}
                        className="styled-input-sm"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="cart-input-lbl">{t('shopLbl', 'Shop / Business')}</label>
                      <input
                        type="text"
                        placeholder={t('shopNamePlaceholder', 'Shop Name (e.g. Kirana Store)')}
                        className="styled-input-sm"
                        value={buyerShop}
                        onChange={(e) => setBuyerShop(e.target.value)}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="cart-input-lbl">{t('phoneLbl', 'Phone / WhatsApp Number *')}</label>
                      <input
                        type="tel"
                        required
                        placeholder={t('phonePlaceholder', '10-digit mobile number')}
                        className="styled-input-sm"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Notes Field */}
              {cart.length > 0 && (
                <div className="cart-notes-section">
                  <label htmlFor="order-notes" className="cart-notes-label">
                    <span>📝 {t('cartOrderNotesLbl', 'Order Notes & Delivery Instructions:')}</span>
                  </label>
                  <textarea
                    id="order-notes"
                    rows="2"
                    className="cart-notes-textarea"
                    placeholder={t('cartOrderNotesPlaceholder', 'e.g. Urgent dispatch requested, pack in dry cartons...')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}

              {checkoutError && (
                <div className="form-error" style={{ marginTop: '12px' }}>
                  {checkoutError}
                </div>
              )}
            </div>

            {/* Drawer Footer / Checkout */}
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total-row">
                  <div className="cart-total-label">
                    <div>{t('totalOrderValue', 'Total Order Value')}</div>
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                      {cartCount} {t('boxes', 'boxes')} · {cart.length} {t('colItem', 'product')}{cart.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="cart-total-amount">
                    ₹{cartTotal.toLocaleString()}
                  </div>
                </div>

                <div className="cart-footer-buttons">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={clearCart}
                    title="Empty entire cart"
                  >
                    {t('clearCart', 'Clear Cart')}
                  </button>
                  <button
                    type="button"
                    className="primary-button cart-checkout-btn"
                    disabled={isSubmitting}
                    onClick={handleCheckout}
                  >
                    {isSubmitting ? t('processingOrder', 'Processing Order…') : `${t('placeOrder', 'Place Order')} (₹${cartTotal.toLocaleString()})`}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
