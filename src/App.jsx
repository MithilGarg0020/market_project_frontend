import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Overview from './components/Overview';
import AgencyDetail from './components/AgencyDetail';
import AdminDashboard from './components/AdminDashboard';
import CartDrawer from './components/CartDrawer';
import MyOrders from './components/MyOrders';
import MemberModal from './components/MemberModal';
import { CartProvider, useCart } from './context/CartContext';
import { MemberProvider, useMember } from './context/MemberContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function Header() {
  const location = useLocation();
  const isOverview = location.pathname === '/';
  const isOrders = location.pathname === '/orders';
  const isAdmin = location.pathname.startsWith('/admin');
  const { setIsCartOpen, cartCount, cartTotal } = useCart();
  const { member, isMemberConfigured, hasPlacedOrders, setIsMemberModalOpen } = useMember();
  const { theme, changeTheme, themes, currentTheme } = useTheme();
  const { language, changeLanguage, languages, currentLanguage, t } = useLanguage();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="site">
      <div className="nav">
        <Link to={isAdmin ? "/admin" : "/"} className="brand" style={{ cursor: 'pointer' }} onClick={() => setIsMobileMenuOpen(false)}>
          <div className="brand-mark">{isAdmin ? 'AP' : 'SK'}</div>
          <div className="brand-text">
            <div className="top">{isAdmin ? 'Admin Portal' : t('brandTop', 'Sanjeev Karyana')}</div>
            <div className="sub">{isAdmin ? 'Stock & Inventory Management' : t('brandSub', 'Stock & Wholesale Storefront')}</div>
          </div>
        </Link>

        {/* Mobile Header Quick Actions: Cart Icon with Badge (Only when member is added) + Hamburger Menu Button */}
        <div className="mobile-header-actions">
          {!isAdmin && isMemberConfigured && (
            <button
              type="button"
              className="mobile-cart-btn"
              onClick={() => {
                setIsCartOpen(true);
                setIsMobileMenuOpen(false);
              }}
              title={t('cartTitle', 'Open Wholesale Cart')}
            >
              <span className="mobile-cart-icon">🛒</span>
              {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
            </button>
          )}

          <button
            type="button"
            className={`hamburger-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>

        {/* Desktop / Large Screen Navlinks */}
        <div className="navlinks desktop-navlinks">
          {isAdmin ? (
            /* Admin view navigation: No 'My Orders' or 'Member' buttons */
            <>
              <Link to="/admin" className="active admin-nav-link">
                🛡️ Admin Dashboard
              </Link>
              <span className="nav-sep">·</span>
              <Link to="/" style={{ color: '#F2A93B', fontWeight: 600 }}>
                ← Storefront
              </Link>
            </>
          ) : (
            /* User / Customer view navigation */
            <>
              <Link to="/" className={isOverview ? 'active' : ''}>{t('navOverview', 'Overview')}</Link>
              
              {/* My Orders Button: Only visible after member has placed an order */}
              {isMemberConfigured && hasPlacedOrders && (
                <>
                  <span className="nav-sep">·</span>
                  <Link to="/orders" className={isOrders ? 'active' : ''}>
                    📋 {t('navMyOrders', 'My Orders')}
                  </Link>
                </>
              )}

              <span className="nav-sep">·</span>
              {/* Member Profile Button */}
              <button
                type="button"
                className="nav-member-btn"
                onClick={() => setIsMemberModalOpen(true)}
                title="Manage Member Profile"
              >
                👤 {member.name ? member.name.split(' ')[0] : t('navMember', 'Member')}
              </button>

              {/* Cart Button: Only visible after a member is added */}
              {isMemberConfigured && (
                <>
                  <span className="nav-sep">·</span>
                  <button
                    type="button"
                    className={`nav-cart-btn ${cartCount > 0 ? 'has-items' : ''}`}
                    onClick={() => setIsCartOpen(true)}
                    title={t('cartTitle', 'Open Wholesale Cart')}
                  >
                    🛒 {t('navCart', 'Cart')}
                    {cartCount > 0 ? (
                      <span className="nav-cart-badge">
                        {cartCount} <span className="cart-badge-amount">· ₹{cartTotal.toLocaleString()}</span>
                      </span>
                    ) : (
                      <span className="nav-cart-empty-tag">0</span>
                    )}
                  </button>
                </>
              )}
            </>
          )}

          {/* Storefront Language Switcher Dropdown (Only for user storefront, not admin) */}
          {!isAdmin && (
            <>
              <span className="nav-sep">·</span>
              <div
                className="lang-switcher-wrapper"
                onMouseEnter={() => {
                  setShowLangMenu(true);
                  setShowThemeMenu(false);
                }}
                onMouseLeave={() => setShowLangMenu(false)}
              >
                <button
                  type="button"
                  className="nav-lang-btn"
                  onClick={() => {
                    setShowLangMenu((prev) => !prev);
                    setShowThemeMenu(false);
                  }}
                  title="Translate Language"
                >
                  <span className="lang-icon">{currentLanguage.icon}</span>
                  <span className="lang-btn-label">{currentLanguage.nativeName}</span>
                  <span className="lang-chevron">▾</span>
                </button>

                {showLangMenu && (
                  <div className="lang-dropdown-menu">
                    <div className="lang-dropdown-header">🌐 {t('selectLanguage', 'Select Language')}</div>
                    {languages.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        className={`lang-dropdown-item ${language === l.id ? 'active' : ''}`}
                        onClick={() => {
                          changeLanguage(l.id);
                          setShowLangMenu(false);
                        }}
                      >
                        <span className="lang-flag">{l.icon}</span>
                        <div className="lang-item-text">
                          <span className="lang-name-native">{l.nativeName}</span>
                          <span className="lang-name-en">({l.name})</span>
                        </div>
                        {language === l.id && <span className="lang-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Theme Switcher Dropdown */}
          <span className="nav-sep">·</span>
          <div
            className="theme-switcher-wrapper"
            onMouseEnter={() => {
              setShowThemeMenu(true);
              setShowLangMenu(false);
            }}
            onMouseLeave={() => setShowThemeMenu(false)}
          >
            <button
              type="button"
              className="nav-theme-btn"
              onClick={() => {
                setShowThemeMenu((prev) => !prev);
                setShowLangMenu(false);
              }}
              title="Change Color Theme"
            >
              <span>{currentTheme.icon}</span>
              <span className="theme-btn-label">{currentTheme.name}</span>
              <span className="theme-chevron">▾</span>
            </button>

            {showThemeMenu && (
              <div className="theme-dropdown-menu">
                <div className="theme-dropdown-header">🎨 {t('paletteTitle', 'Select Palette')}</div>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`theme-dropdown-item ${theme === t.id ? 'active' : ''}`}
                    onClick={() => {
                      changeTheme(t.id);
                      setShowThemeMenu(false);
                    }}
                  >
                    <span className="theme-icon">{t.icon}</span>
                    <span className="theme-name">{t.name}</span>
                    <span className="theme-preview-dot" style={{ background: t.color }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className="mobile-nav-item active"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mobile-nav-icon">🛡️</span>
                <span className="mobile-nav-text">Admin Dashboard</span>
              </Link>
              <Link
                to="/"
                className="mobile-nav-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mobile-nav-icon">🏪</span>
                <span className="mobile-nav-text">View Storefront</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`mobile-nav-item ${isOverview ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mobile-nav-icon">🏠</span>
                <span className="mobile-nav-text">{t('navOverview', 'Overview')}</span>
              </Link>

              {isMemberConfigured && hasPlacedOrders && (
                <Link
                  to="/orders"
                  className={`mobile-nav-item ${isOrders ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">📄</span>
                  <span className="mobile-nav-text">{t('navMyOrders', 'My Orders')}</span>
                </Link>
              )}

              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => {
                  setIsMemberModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="mobile-nav-icon">👤</span>
                <span className="mobile-nav-text">
                  {member.name ? `${t('navMember', 'Member')} (${member.name.split(' ')[0]})` : t('navMember', 'Member')}
                </span>
              </button>

              {/* Language Row in Mobile Drawer */}
              <div className="mobile-lang-row">
                <div className="mobile-lang-label">
                  <span>🌐 {t('navLanguage', 'Language')} / Translation:</span>
                </div>
                <div className="mobile-lang-subgrid">
                  {languages.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className={`mobile-lang-chip ${language === l.id ? 'active' : ''}`}
                      onClick={() => {
                        changeLanguage(l.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span className="lang-flag">{l.icon}</span>
                      <span className="lang-text">{l.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Theme Row in Drawer with Submenu */}
          <div className="mobile-theme-row">
            <button
              type="button"
              className="mobile-nav-item mobile-theme-toggle"
              onClick={() => setShowThemeMenu((prev) => !prev)}
            >
              <span className="mobile-nav-icon">🎨</span>
              <span className="mobile-nav-text">{t('navTheme', 'Theme')}</span>
              <span className="mobile-theme-current">
                {currentTheme.name} <span className="theme-chevron">{showThemeMenu ? '▴' : '▾'}</span>
              </span>
            </button>

            {showThemeMenu && (
              <div className="mobile-theme-subgrid">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`mobile-theme-chip ${theme === t.id ? 'active' : ''}`}
                    onClick={() => {
                      changeTheme(t.id);
                      setShowThemeMenu(false);
                    }}
                  >
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                    <span className="theme-preview-dot" style={{ background: t.color }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MemberProvider>
          <CartProvider>
            <Header />
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/agency/:id" element={<AgencyDetail />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
            <CartDrawer />
            <MemberModal />
          </CartProvider>
        </MemberProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}


