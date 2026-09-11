import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ICONS, AGENCY_ICONS } from '../constants/icons';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Data State
  const [loading, setLoading] = useState(true);
  const [agencies, setAgencies] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('inventory'); // 'inventory' | 'agencies' | 'orders' | 'members'
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMemberForOrders, setSelectedMemberForOrders] = useState(null); // { member, orders: [] }
  const [loadingMemberOrders, setLoadingMemberOrders] = useState(false);
  const [timeRange, setTimeRange] = useState('all'); // 'day' | 'week' | 'month' | 'year' | 'custom' | 'all'
  const [customDate, setCustomDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Forms and Modals
  const [showAddAgency, setShowAddAgency] = useState(false);
  const [agencyForm, setAgencyForm] = useState({ name: '', category: '', colorHex: '#F1E9D6', iconKey: 'box' });
  const [agencyError, setAgencyError] = useState(null);

  const [showAddItem, setShowAddItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    agency: '',
    name: '',
    packagingType: 'box', // 'box' | 'bag'
    unitsPerBox: 12,
    boxesInStock: 0,
    pricePerBox: 0,
    threshold: 5
  });
  const [itemError, setItemError] = useState(null);

  // Edit Agency
  const [editingAgency, setEditingAgency] = useState(null);
  const [editAgencyData, setEditAgencyData] = useState({ name: '', category: '', colorHex: '#F1E9D6', iconKey: 'box' });

  // Edit Item
  const [editingItem, setEditingItem] = useState(null);
  const [editItemData, setEditItemData] = useState({ name: '', packagingType: 'box', unitsPerBox: 12, boxesInStock: 0, pricePerBox: 0, lowStockThreshold: 5 });

  // Inline edit order customer phone
  const [editingOrderPhoneId, setEditingOrderPhoneId] = useState(null);
  const [editingOrderPhoneVal, setEditingOrderPhoneVal] = useState('');

  // Check saved PIN on mount
  useEffect(() => {
    const savedPin = localStorage.getItem('karyana_admin_pin');
    if (savedPin) {
      verifyPin(savedPin);
    } else {
      setLoading(false);
    }
  }, []);

  async function verifyPin(pinToTest) {
    setIsVerifying(true);
    setAuthError(null);
    try {
      localStorage.setItem('karyana_admin_pin', pinToTest);
      await api.adminVerifyPin(pinToTest);
      setIsAuthenticated(true);
      loadAdminData();
    } catch (err) {
      localStorage.removeItem('karyana_admin_pin');
      setIsAuthenticated(false);
      setAuthError(err.message || 'Incorrect Admin PIN');
      setLoading(false);
    } finally {
      setIsVerifying(false);
    }
  }

  function handleLoginSubmit(e) {
    e.preventDefault();
    if (!pinInput.trim()) return;
    verifyPin(pinInput.trim());
  }

  // Pin Change Modal State
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [pinChangeLoading, setPinChangeLoading] = useState(false);
  const [pinChangeError, setPinChangeError] = useState(null);
  const [pinChangeSuccess, setPinChangeSuccess] = useState(null);

  // Toggle PIN visibility
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);

  async function handleChangePinSubmit(e) {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeSuccess(null);

    if (!pinForm.currentPin.trim()) {
      setPinChangeError('Please enter your current passcode.');
      return;
    }
    if (!pinForm.newPin.trim()) {
      setPinChangeError('Please enter a new passcode.');
      return;
    }
    if (pinForm.newPin.length < 6) {
      setPinChangeError('New passcode must be at least 6 characters for strong security.');
      return;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinChangeError('New passcodes do not match.');
      return;
    }

    setPinChangeLoading(true);
    try {
      await api.adminChangePin(pinForm.currentPin.trim(), pinForm.newPin.trim());
      localStorage.setItem('karyana_admin_pin', pinForm.newPin.trim());
      setPinChangeSuccess('Passcode updated successfully!');
      setTimeout(() => {
        setShowChangePinModal(false);
        setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
        setPinChangeSuccess(null);
      }, 1500);
    } catch (err) {
      setPinChangeError(err.message || 'Failed to update passcode.');
    } finally {
      setPinChangeLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('karyana_admin_pin');
    setIsAuthenticated(false);
    setPinInput('');
  }

  async function loadAdminData() {
    setLoading(true);
    try {
      const [agenciesRes, itemsRes, statsRes, ordersRes, membersRes] = await Promise.all([
        api.getAgencies(),
        api.getItems(),
        api.adminGetStats(),
        api.adminGetOrders().catch(() => []),
        api.getMembers().catch(() => [])
      ]);
      setAgencies(agenciesRes);
      setItems(itemsRes);
      setStats(statsRes);
      setOrders(ordersRes || []);
      setMembers(membersRes || []);
      if (agenciesRes.length > 0 && !itemForm.agency) {
        setItemForm((prev) => ({ ...prev, agency: agenciesRes[0]._id }));
      }
    } catch (err) {
      alert('Failed to load admin data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewMemberOrders(memberItem) {
    if (!memberItem.phone) {
      setSelectedMemberForOrders({ member: memberItem, orders: [] });
      return;
    }
    setLoadingMemberOrders(true);
    setSelectedMemberForOrders({ member: memberItem, orders: [] });
    try {
      const data = await api.getMemberDetails(memberItem.phone);
      setSelectedMemberForOrders({
        member: data.member || memberItem,
        orders: data.orders || []
      });
    } catch {
      // Fallback: filter from current orders state
      const matching = orders.filter((o) => o.customerPhone === memberItem.phone);
      setSelectedMemberForOrders({
        member: memberItem,
        orders: matching
      });
    } finally {
      setLoadingMemberOrders(false);
    }
  }

  async function handleDeleteMember(memberId, memberName) {
    if (!window.confirm(`Delete member profile "${memberName}"?`)) return;
    try {
      await api.deleteMember(memberId);
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
    } catch (err) {
      alert('Failed to delete member: ' + err.message);
    }
  }

  async function handleAdminOrderStatus(orderId, newStatus) {
    try {
      await api.adminUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId || o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert('Failed to update order status: ' + err.message);
    }
  }

  async function handleAdminSaveOrderPhone(orderId) {
    if (!editingOrderPhoneVal.trim()) return;
    try {
      await api.adminUpdateOrder(orderId, { customerPhone: editingOrderPhoneVal.trim() });
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId || o._id === orderId ? { ...o, customerPhone: editingOrderPhoneVal.trim() } : o))
      );
      setEditingOrderPhoneId(null);
      setEditingOrderPhoneVal('');
    } catch (err) {
      alert('Failed to update phone number: ' + err.message);
    }
  }

  async function handleAdminDeleteOrder(orderId) {
    if (!window.confirm(`Delete order #${orderId}? This cannot be undone.`)) return;
    try {
      await api.adminDeleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId && o._id !== orderId));
      api.adminGetStats().then(setStats).catch(() => {});
    } catch (err) {
      alert('Failed to delete order: ' + err.message);
    }
  }

  async function handleAdminClearAllOrders() {
    if (!window.confirm('Clear ALL orders history in the system? This action cannot be reversed.')) return;
    try {
      await api.adminClearOrders();
      setOrders([]);
      api.adminGetStats().then(setStats).catch(() => {});
    } catch (err) {
      alert('Failed to clear orders: ' + err.message);
    }
  }

  // Quick Restock / Dispatch
  async function handleQuickStockChange(itemId, diff) {
    try {
      if (diff > 0) {
        const updated = await api.adminRestockItem(itemId, diff);
        setItems((prev) => prev.map((it) => (it._id === itemId ? updated : it)));
      } else {
        const updated = await api.adminDispatchItem(itemId, Math.abs(diff));
        setItems((prev) => prev.map((it) => (it._id === itemId ? updated : it)));
      }
      // Refresh stats
      api.adminGetStats().then(setStats).catch(() => {});
      api.getAgencies().then(setAgencies).catch(() => {});
    } catch (err) {
      alert('Failed to update stock: ' + err.message);
    }
  }

  // Agency CRUD
  async function handleCreateAgency(e) {
    e.preventDefault();
    setAgencyError(null);
    try {
      await api.adminCreateAgency(agencyForm);
      setAgencyForm({ name: '', category: '', colorHex: '#F1E9D6', iconKey: 'box' });
      setShowAddAgency(false);
      loadAdminData();
    } catch (err) {
      setAgencyError(err.message);
    }
  }

  async function handleUpdateAgency(e) {
    e.preventDefault();
    if (!editingAgency) return;
    try {
      await api.adminUpdateAgency(editingAgency._id, editAgencyData);
      setEditingAgency(null);
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteAgency(agencyId, agencyName) {
    const confirm = window.confirm(`Are you sure you want to delete "${agencyName}" and all associated products?`);
    if (!confirm) return;
    try {
      await api.adminDeleteAgency(agencyId);
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Item CRUD
  async function handleCreateItem(e) {
    e.preventDefault();
    setItemError(null);
    try {
      await api.adminCreateItem({
        agency: itemForm.agency,
        name: itemForm.name.trim(),
        unitsPerBox: Number(itemForm.unitsPerBox) || 1,
        boxesInStock: Number(itemForm.boxesInStock) || 0,
        pricePerBox: Number(itemForm.pricePerBox) || 0,
        threshold: Number(itemForm.threshold) || 5
      });
      setItemForm((prev) => ({
        ...prev,
        name: '',
        boxesInStock: 0,
        pricePerBox: 0
      }));
      setShowAddItem(false);
      loadAdminData();
    } catch (err) {
      setItemError(err.message);
    }
  }

  async function handleUpdateItem(e) {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await api.adminUpdateItem(editingItem._id, {
        name: editItemData.name.trim(),
        unitsPerBox: Number(editItemData.unitsPerBox) || 1,
        boxesInStock: Number(editItemData.boxesInStock) || 0,
        pricePerBox: Number(editItemData.pricePerBox) || 0,
        lowStockThreshold: Number(editItemData.lowStockThreshold) || 0
      });
      setEditingItem(null);
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteItem(itemId, itemName) {
    const confirm = window.confirm(`Delete item "${itemName}"?`);
    if (!confirm) return;
    try {
      await api.adminDeleteItem(itemId);
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    const agencyMatch =
      selectedAgencyFilter === 'ALL' ||
      item.agency?._id === selectedAgencyFilter ||
      item.agency === selectedAgencyFilter;
    const searchMatch = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return agencyMatch && searchMatch;
  });

  if (!isAuthenticated) {
    return (
      <div className="admin-pin-wrapper">
        <div className="admin-pin-card">
          <div className="admin-pin-badge">🔐 Admin Access</div>
          <h2>Enter Admin Passcode</h2>
          <p>Please enter the security PIN to access the warehouse administrative controls.</p>

          <form onSubmit={handleLoginSubmit}>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input
                type={showLoginPin ? 'text' : 'password'}
                placeholder="Enter Admin PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                className="admin-pin-input"
                style={{ paddingRight: '46px', marginBottom: 0 }}
              />
              <button
                type="button"
                onClick={() => setShowLoginPin((prev) => !prev)}
                title={showLoginPin ? 'Hide PIN' : 'Show PIN'}
                aria-label={showLoginPin ? 'Hide PIN' : 'Show PIN'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1,
                  padding: '4px',
                  color: 'var(--ink-soft)'
                }}
              >
                {showLoginPin ? '👁️' : '🙈'}
              </button>
            </div>
            {authError && <div className="form-error">{authError}</div>}

            <div className="admin-pin-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate('/')}
              >
                Back to Store
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying…' : 'Unlock Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="admin-container">
      {/* Top Header */}
      <div className="admin-top-bar">
        <div>
          <div className="admin-pill">ADMINISTRATIVE PORTAL</div>
          <h1 style={{ fontFamily: 'Bitter, serif', fontSize: '26px', margin: '4px 0 2px' }}>
            Store Stock Administration
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>
            Manage agencies, replenish stock boxes, dispatch store units, and review warehouse thresholds.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/')}
          >
            ← View Storefront
          </button>
          <button
            type="button"
            className="secondary-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: 'var(--marigold)',
              color: 'var(--indigo-deep)',
              fontWeight: 600
            }}
            onClick={() => {
              setPinChangeError(null);
              setPinChangeSuccess(null);
              setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
              setShowChangePinModal(true);
            }}
          >
            🔑 Change PIN
          </button>
          <button
            type="button"
            className="danger-button"
            onClick={handleLogout}
          >
            Lock Admin
          </button>
        </div>
      </div>

      {/* Time Range Filter Bar */}
      <div
        className="admin-time-range-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 18,
          background: 'var(--paper)',
          padding: '12px 18px',
          borderRadius: 12,
          border: '1px solid var(--line)',
          boxShadow: '0 2px 8px rgba(43, 38, 32, 0.03)'
        }}
      >
        <div className="admin-time-range-label-wrap" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--indigo-deep)', display: 'flex', alignItems: 'center', gap: 6 }}>
            📅 View By Period:
          </span>
          <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
            Filter sales revenue, member orders &amp; records
          </span>
        </div>

        <div className="admin-time-range-pills" style={{ display: 'flex', background: 'var(--ivory)', padding: 3, borderRadius: 8, border: '1px solid var(--line)', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { id: 'day', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' },
            { id: 'all', label: 'All Time' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTimeRange(t.id)}
              style={{
                border: 'none',
                background: timeRange === t.id ? 'var(--indigo)' : 'transparent',
                color: timeRange === t.id ? '#FFFFFF' : 'var(--ink)',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: timeRange === t.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}

          {/* Calendar Date Picker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '2px 8px',
              borderRadius: 6,
              background: timeRange === 'custom' ? 'var(--indigo)' : 'transparent',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ fontSize: 13 }} title="Pick a specific date">📅</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setTimeRange('custom');
              }}
              onClick={() => setTimeRange('custom')}
              style={{
                border: timeRange === 'custom' ? '1px solid rgba(255,255,255,0.4)' : '1px solid var(--line)',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'inherit',
                background: timeRange === 'custom' ? '#FFFFFF' : 'var(--paper)',
                color: 'var(--indigo-deep)',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Filter by specific date"
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      {stats && (() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

        const isWithinTimeRange = (dateStr) => {
          if (timeRange === 'all') return true;
          if (!dateStr) return false;
          const dObj = new Date(dateStr);
          const t = dObj.getTime();
          if (timeRange === 'day') return t >= startOfDay;
          if (timeRange === 'week') return t >= startOfWeek;
          if (timeRange === 'month') return t >= startOfMonth;
          if (timeRange === 'year') return t >= startOfYear;
          if (timeRange === 'custom' && customDate) {
            const ordDate = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
            return ordDate === customDate;
          }
          return true;
        };

        const timeLabelMap = {
          day: 'Today',
          week: 'This Week',
          month: 'This Month',
          year: 'This Year',
          custom: `Date: ${customDate}`,
          all: 'All Time'
        };

        const filteredPeriodOrders = orders.filter((o) => isWithinTimeRange(o.createdAt));
        const periodRevenue = filteredPeriodOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const periodOrderCount = filteredPeriodOrders.length;
        const currentPeriodLabel = timeLabelMap[timeRange] || 'Selected';

        return (
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="stat-title">Total Agencies</div>
              <div className="stat-number">{stats.totalAgencies}</div>
              <div className="stat-sub">Active suppliers</div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-title">Total Item Varieties</div>
              <div className="stat-number">{stats.totalItems}</div>
              <div className="stat-sub">Tracked products</div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-title">Warehouse Stock</div>
              <div className="stat-number" style={{ color: 'var(--indigo-deep)' }}>
                {stats.totalBoxes} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>boxes</span>
              </div>
              <div className="stat-sub">Across all agencies</div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-title">Inventory Valuation</div>
              <div className="stat-number" style={{ color: '#2E7D32' }}>
                ₹{(stats.totalInventoryValue || 0).toLocaleString()}
              </div>
              <div className="stat-sub">Warehouse stock value</div>
            </div>
            <div className="admin-stat-card" style={{ background: '#F4F9F4', borderColor: '#C8E6C9' }}>
              <div className="stat-title" style={{ color: '#2E7D32' }}>
                💰 Sales Revenue ({currentPeriodLabel})
              </div>
              <div className="stat-number" style={{ color: '#1B5E20' }}>
                ₹{periodRevenue.toLocaleString()}
              </div>
              <div className="stat-sub">
                From {periodOrderCount} orders ({timeRange === 'all' ? 'All time' : currentPeriodLabel})
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-title">📋 Orders ({currentPeriodLabel})</div>
              <div className="stat-number" style={{ color: 'var(--indigo)' }}>
                {periodOrderCount}
              </div>
              <div className="stat-sub">
                {timeRange === 'all' ? 'Total orders placed' : `Orders in ${currentPeriodLabel}`}
              </div>
            </div>
            <div className={`admin-stat-card ${stats.lowStockCount > 0 ? 'alert-card' : ''}`}>
              <div className="stat-title">Low / Out of Stock</div>
              <div className="stat-number" style={{ color: stats.lowStockCount > 0 ? 'var(--brick)' : 'var(--sage)' }}>
                {stats.lowStockCount}
              </div>
              <div className="stat-sub">{stats.outOfStockCount} zero stock items</div>
            </div>
          </div>
        );
      })()}

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${tab === 'inventory' ? 'active' : ''}`}
          onClick={() => setTab('inventory')}
        >
          📦 Inventory &amp; Stock Operations
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${tab === 'agencies' ? 'active' : ''}`}
          onClick={() => setTab('agencies')}
        >
          🏢 Agency Management ({agencies.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${tab === 'orders' ? 'active' : ''}`}
          onClick={() => setTab('orders')}
        >
          📋 Member Orders &amp; History ({(() => {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)).getTime();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
            const inRange = (d) => {
              if (timeRange === 'all') return true;
              if (!d) return false;
              const dObj = new Date(d);
              const t = dObj.getTime();
              if (timeRange === 'day') return t >= startOfDay;
              if (timeRange === 'week') return t >= startOfWeek;
              if (timeRange === 'month') return t >= startOfMonth;
              if (timeRange === 'year') return t >= startOfYear;
              if (timeRange === 'custom' && customDate) {
                const ordDate = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
                return ordDate === customDate;
              }
              return true;
            };
            const c = orders.filter((o) => inRange(o.createdAt)).length;
            return timeRange === 'all' ? c : `${c} / ${orders.length}`;
          })()})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${tab === 'members' ? 'active' : ''}`}
          onClick={() => setTab('members')}
        >
          👤 Member Profiles ({members.length})
        </button>
      </div>

      {loading ? (
        <div className="state-msg">Loading administrative records…</div>
      ) : tab === 'inventory' ? (
        /* ================= INVENTORY TAB ================= */
        <div className="admin-section">
          <div className="admin-toolbar">
            <div className="admin-filter-group">
              <input
                type="text"
                placeholder="Search item name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
              <select
                value={selectedAgencyFilter}
                onChange={(e) => setSelectedAgencyFilter(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Agencies ({agencies.length})</option>
                {agencies.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.category})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => setShowAddItem((prev) => !prev)}
            >
              {showAddItem ? '✕ Cancel' : '+ Add New Item'}
            </button>
          </div>

          {/* Add Item Form */}
          {showAddItem && (
            <form className="agency-form admin-form-box" onSubmit={handleCreateItem}>
              <div className="form-heading">
                <h3>Add New Inventory Product</h3>
                <p>Register a new item under an agency for warehouse box tracking.</p>
              </div>
              <div className="form-grid">
                <label>
                  Select Agency
                  <select
                    value={itemForm.agency}
                    onChange={(e) => setItemForm({ ...itemForm, agency: e.target.value })}
                    required
                  >
                    {agencies.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name} ({a.category})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Item Name
                  <input
                    placeholder="e.g. Uttam Ghee 1L Tin"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Packaging Format
                  <select
                    value={itemForm.packagingType || 'box'}
                    onChange={(e) => setItemForm({ ...itemForm, packagingType: e.target.value })}
                    required
                  >
                    <option value="box">📦 Box (Wholesale Carton)</option>
                    <option value="bag">🛍️ Bag (Sack / Bori)</option>
                  </select>
                </label>
                <label>
                  Units per {itemForm.packagingType === 'bag' ? 'Bag' : 'Box'}
                  <input
                    type="number"
                    min="1"
                    value={itemForm.unitsPerBox}
                    onChange={(e) => setItemForm({ ...itemForm, unitsPerBox: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Initial {itemForm.packagingType === 'bag' ? 'Bags' : 'Boxes'} In Stock
                  <input
                    type="number"
                    min="0"
                    value={itemForm.boxesInStock}
                    onChange={(e) => setItemForm({ ...itemForm, boxesInStock: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Price per {itemForm.packagingType === 'bag' ? 'Bag' : 'Box'} (₹)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 1200"
                    value={itemForm.pricePerBox}
                    onChange={(e) => setItemForm({ ...itemForm, pricePerBox: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Low Stock Threshold
                  <input
                    type="number"
                    min="0"
                    value={itemForm.threshold}
                    onChange={(e) => setItemForm({ ...itemForm, threshold: e.target.value })}
                    required
                  />
                </label>
              </div>
              {itemError && <p className="form-error">{itemError}</p>}
              <button type="submit" className="primary-button form-submit">
                Save Product
              </button>
            </form>
          )}

          {/* Inventory Table */}
          {filteredItems.length === 0 ? (
            <div className="state-msg">No inventory items match your search.</div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product &amp; Agency</th>
                    <th className="center">Wholesale Price</th>
                    <th className="center">Units / Box</th>
                    <th className="center">Status</th>
                    <th className="center">Boxes In Stock</th>
                    <th className="center">Quick Restock / Dispatch</th>
                    <th className="right">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const agencyObj = typeof item.agency === 'object' ? item.agency : agencies.find((a) => a._id === item.agency);
                    const threshold = item.lowStockThreshold ?? item.threshold ?? 5;
                    const isLow = (item.boxesInStock || 0) <= threshold;
                    const pricePerBox = item.pricePerBox || 0;
                    const pricePerUnit = item.pricePerUnit || (item.unitsPerBox ? (pricePerBox / item.unitsPerBox).toFixed(2) : 0);

                    const pkgType = item.packagingType === 'bag' ? 'bag' : 'box';
                    const PkgCap = item.packagingType === 'bag' ? 'Bag' : 'Box';

                    return (
                      <tr key={item._id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                            {agencyObj ? agencyObj.name : 'Unknown Agency'} · {formatDate(item.lastRestocked)}
                          </div>
                        </td>
                        <td className="center">
                          <div className="admin-price-cell">
                            <span className="box-price">₹{pricePerBox.toLocaleString()} <span className="unit-label">/{pkgType}</span></span>
                            <span className="per-pc-price">₹{pricePerUnit} /pc</span>
                          </div>
                        </td>
                        <td className="center units-tag">{item.unitsPerBox} pcs/{pkgType}</td>
                        <td className="center">
                          <span className={isLow ? 'low-tag' : 'ok-tag'}>
                            {isLow ? `● Low (≤${threshold})` : '● In stock'}
                          </span>
                        </td>
                        <td className="center">
                          <span className={`qty-pill ${isLow ? 'low' : ''}`}>
                            {String(item.boxesInStock).padStart(2, '0')} <span>{pkgType}</span>
                          </span>
                        </td>
                        <td className="center">
                          <div className="quick-action-cluster">
                            <button
                              type="button"
                              className="stock-btn dispatch"
                              title={`Dispatch 1 ${pkgType}`}
                              disabled={item.boxesInStock <= 0}
                              onClick={() => handleQuickStockChange(item._id, -1)}
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              className="stock-btn dispatch"
                              title={`Dispatch 5 ${pkgType === 'bag' ? 'bags' : 'boxes'}`}
                              disabled={item.boxesInStock < 5}
                              onClick={() => handleQuickStockChange(item._id, -5)}
                            >
                              -5
                            </button>
                            <span className="stock-btn-sep">|</span>
                            <button
                              type="button"
                              className="stock-btn restock"
                              title={`Restock +1 ${pkgType}`}
                              onClick={() => handleQuickStockChange(item._id, 1)}
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              className="stock-btn restock"
                              title={`Restock +5 ${pkgType === 'bag' ? 'bags' : 'boxes'}`}
                              onClick={() => handleQuickStockChange(item._id, 5)}
                            >
                              +5
                            </button>
                          </div>
                        </td>
                        <td className="right">
                          <div className="action-btns-group" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="card-edit-btn"
                              onClick={() => {
                                setEditingItem(item);
                                setEditItemData({
                                  name: item.name,
                                  packagingType: item.packagingType || 'box',
                                  unitsPerBox: item.unitsPerBox,
                                  boxesInStock: item.boxesInStock,
                                  pricePerBox: item.pricePerBox ?? 0,
                                  lowStockThreshold: item.lowStockThreshold ?? item.threshold ?? 5
                                });
                              }}
                            >
                              ✎ Edit
                            </button>
                            <button
                              type="button"
                              className="card-delete-btn"
                              onClick={() => handleDeleteItem(item._id, item.name)}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : tab === 'agencies' ? (
        /* ================= AGENCIES TAB ================= */
        <div className="admin-section">
          <div className="admin-toolbar">
            <div>
              <h3>Agencies &amp; Suppliers</h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                Configure suppliers, logos, and classifications.
              </p>
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={() => setShowAddAgency((prev) => !prev)}
            >
              {showAddAgency ? '✕ Cancel' : '+ Add New Agency'}
            </button>
          </div>

          {/* Add Agency Form */}
          {showAddAgency && (
            <form className="agency-form admin-form-box" onSubmit={handleCreateAgency}>
              <div className="form-heading">
                <h3>Add New Agency</h3>
                <p>Register a new brand or supplier in the inventory database.</p>
              </div>
              <div className="form-grid">
                <label>
                  Agency Name
                  <input
                    value={agencyForm.name}
                    onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                    required
                    placeholder="e.g. Parle Agro, Fortune"
                  />
                </label>
                <label>
                  Category
                  <input
                    value={agencyForm.category}
                    onChange={(e) => setAgencyForm({ ...agencyForm, category: e.target.value })}
                    required
                    placeholder="e.g. Biscuits, Edible Oil"
                  />
                </label>
                <label>
                  Icon
                  <select
                    value={agencyForm.iconKey}
                    onChange={(e) => setAgencyForm({ ...agencyForm, iconKey: e.target.value })}
                  >
                    {Object.entries(AGENCY_ICONS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.emoji} {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Color Badge
                  <input
                    type="color"
                    value={agencyForm.colorHex}
                    onChange={(e) => setAgencyForm({ ...agencyForm, colorHex: e.target.value })}
                  />
                </label>
              </div>
              {agencyError && <p className="form-error">{agencyError}</p>}
              <button type="submit" className="primary-button form-submit">
                Save Agency
              </button>
            </form>
          )}

          {/* Agencies Grid */}
          <div className="agency-grid" style={{ marginTop: '16px' }}>
            {agencies.map((agency) => (
              <div key={agency._id} className="agency-card">
                <div className="top-row">
                  <div className="icon-box" style={{ background: agency.colorHex }}>
                    {ICONS[agency.iconKey] || ICONS.box}
                  </div>
                  <div className="box-badge">
                    {agency.totalBoxes ?? 0}
                    <span>box</span>
                  </div>
                </div>
                <h3>{agency.name}</h3>
                <div className="cat">{agency.itemCount ?? 0} item types · {agency.category}</div>
                <div className="agency-card-footer" style={{ marginTop: '14px' }}>
                  <button
                    type="button"
                    className="view-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => {
                      setSelectedAgencyFilter(agency._id);
                      setTab('inventory');
                    }}
                  >
                    Manage items ({agency.itemCount ?? 0}) →
                  </button>
                  <div className="action-btns-group">
                    <button
                      type="button"
                      className="card-edit-btn"
                      onClick={() => {
                        setEditingAgency(agency);
                        setEditAgencyData({
                          name: agency.name,
                          category: agency.category,
                          colorHex: agency.colorHex || '#F1E9D6',
                          iconKey: agency.iconKey || 'box'
                        });
                      }}
                    >
                      ✎ Edit
                    </button>
                    <button
                      type="button"
                      className="card-delete-btn"
                      onClick={() => handleDeleteAgency(agency._id, agency.name)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'orders' ? (
        /* ================= ORDERS TAB ================= */
        <div className="admin-section">
          <div className="admin-toolbar">
            <div className="admin-filter-group">
              <input
                type="text"
                placeholder="Search orders by ID, buyer name, phone, or shop…"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="admin-search-input"
                style={{ minWidth: 320 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Date / Calendar Filter in Orders Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8F6F0', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 13 }}>📅</span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setTimeRange('custom');
                  }}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    background: '#FFFFFF',
                    color: 'var(--indigo-deep)',
                    cursor: 'pointer'
                  }}
                  title="Filter orders by specific date"
                />
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    setCustomDate(todayStr);
                    setTimeRange('day');
                  }}
                  style={{
                    border: 'none',
                    background: timeRange === 'day' ? 'var(--indigo)' : 'var(--ivory)',
                    color: timeRange === 'day' ? '#FFFFFF' : 'var(--ink)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Show orders placed today"
                >
                  Today
                </button>
                {timeRange !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setTimeRange('all')}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--brick)',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '2px 4px'
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>

              {timeRange !== 'all' && (
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', background: '#F1E9D6', padding: '4px 10px', borderRadius: 6 }}>
                  Showing: <strong>{{ day: 'Today', week: 'This Week', month: 'This Month', year: 'This Year', custom: `Date: ${customDate}` }[timeRange] || timeRange}</strong>
                </div>
              )}
              {orders.length > 0 && (
                <button
                  type="button"
                  className="clear-orders-btn"
                  onClick={handleAdminClearAllOrders}
                  title="Clear all order records"
                >
                  🗑️ Clear All Orders History
                </button>
              )}
            </div>
          </div>

          {(() => {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)).getTime();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
            const isWithinTimeRange = (d) => {
              if (timeRange === 'all') return true;
              if (!d) return false;
              const dObj = new Date(d);
              const t = dObj.getTime();
              if (timeRange === 'day') return t >= startOfDay;
              if (timeRange === 'week') return t >= startOfWeek;
              if (timeRange === 'month') return t >= startOfMonth;
              if (timeRange === 'year') return t >= startOfYear;
              if (timeRange === 'custom' && customDate) {
                const ordDate = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
                return ordDate === customDate;
              }
              return true;
            };

            const filteredOrders = orders.filter((ord) => {
              if (!isWithinTimeRange(ord.createdAt)) return false;
              if (!orderSearchQuery.trim()) return true;
              const q = orderSearchQuery.toLowerCase();
              return (
                ord.orderId.toLowerCase().includes(q) ||
                (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
                (ord.shopName && ord.shopName.toLowerCase().includes(q)) ||
                (ord.customerPhone && ord.customerPhone.includes(q)) ||
                (ord.items && ord.items.some((i) => i.name.toLowerCase().includes(q)))
              );
            });

            if (filteredOrders.length === 0) {
              return (
                <div className="state-msg empty-orders-state">
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                  <h3>No Wholesale Orders</h3>
                  <p>No customer orders recorded yet.</p>
                </div>
              );
            }

            return (
              <div className="admin-orders-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredOrders.map((ord) => {
                  const statusColors = {
                    confirmed: { bg: '#E3F2FD', color: '#1565C0', label: '✓ Confirmed' },
                    dispatched: { bg: '#FFF8E1', color: '#F57F17', label: '🚚 Dispatched' },
                    delivered: { bg: '#E8F5E9', color: '#2E7D32', label: '★ Delivered' },
                    cancelled: { bg: '#FFEBEE', color: '#C62828', label: '✕ Cancelled' }
                  };
                  const st = statusColors[ord.status] || statusColors.confirmed;

                  return (
                    <div key={ord._id || ord.orderId} className="admin-order-card" style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', background: '#F8F6F0', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontFamily: 'Bitter', fontWeight: 800, fontSize: 17, color: 'var(--indigo-deep)' }}>
                            {ord.orderId}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: st.bg, color: st.color, textTransform: 'uppercase' }}>
                            {st.label}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                            {new Date(ord.createdAt).toLocaleString('en-GB')}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <select
                            value={ord.status || 'confirmed'}
                            onChange={(e) => handleAdminOrderStatus(ord.orderId || ord._id, e.target.value)}
                            className="admin-select"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <button
                            type="button"
                            className="card-delete-btn"
                            onClick={() => handleAdminDeleteOrder(ord.orderId || ord._id)}
                            title="Delete this order"
                          >
                            🗑
                          </button>
                        </div>
                      </div>

                      <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                        <div style={{ flex: 1, minWidth: 240 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo-deep)', marginBottom: 4 }}>
                            👤 Customer / Member Details:
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{ord.customerName || 'Guest Member'}</div>
                          {ord.shopName && <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>🏪 {ord.shopName}</div>}
                          
                          {editingOrderPhoneId === (ord.orderId || ord._id) ? (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                              <input
                                type="tel"
                                value={editingOrderPhoneVal}
                                onChange={(e) => setEditingOrderPhoneVal(e.target.value)}
                                placeholder="Phone number"
                                className="styled-input"
                                style={{ padding: '3px 8px', fontSize: 12, width: 130 }}
                                autoFocus
                              />
                              <button
                                type="button"
                                className="primary-button-sm"
                                style={{ padding: '3px 8px', fontSize: 11 }}
                                onClick={() => handleAdminSaveOrderPhone(ord.orderId || ord._id)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="secondary-button"
                                style={{ padding: '3px 8px', fontSize: 11 }}
                                onClick={() => setEditingOrderPhoneId(null)}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <span>📞 {ord.customerPhone || 'No Phone'}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOrderPhoneId(ord.orderId || ord._id);
                                  setEditingOrderPhoneVal(ord.customerPhone || '');
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--sage-deep)',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  textDecoration: 'underline'
                                }}
                                title="Edit phone number"
                              >
                                ✎ Edit
                              </button>
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 2, minWidth: 280 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo-deep)', marginBottom: 6 }}>
                            📦 Ordered Items ({ord.items ? ord.items.length : 0}):
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {ord.items && ord.items.map((it, idx) => {
                              const pkg = it.packagingType === 'bag' ? 'bag' : 'box';
                              const pkgPlural = it.packagingType === 'bag' ? (it.boxesBought === 1 ? 'bag' : 'bags') : (it.boxesBought === 1 ? 'box' : 'boxes');
                              return (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px dashed var(--line)', paddingBottom: 4 }}>
                                  <div>
                                    <strong>{it.name}</strong> <span style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>({it.agencyName})</span>
                                    <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                                      {it.buyType === 'unit'
                                        ? `${it.unitsBought} pcs @ ₹${it.rate}/pc`
                                        : `${it.boxesBought} ${pkgPlural} (${it.unitsBought} pcs) @ ₹${it.rate}/${pkg}`}
                                    </div>
                                  </div>
                                  <div style={{ fontWeight: 700 }}>₹{(it.subtotal || 0).toLocaleString()}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: 160 }}>
                          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Grand Total</div>
                          <div style={{ fontFamily: 'Bitter', fontWeight: 800, fontSize: 20, color: 'var(--brick)' }}>
                            ₹{(ord.grandTotal || 0).toLocaleString()}
                          </div>
                          {ord.notes && (
                            <div style={{ marginTop: 6, fontSize: 11.5, background: '#F8F5EE', padding: '4px 8px', borderRadius: 6, textAlign: 'left' }}>
                              <strong>Note:</strong> {ord.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ) : (
        /* ================= MEMBERS TAB ================= */
        <div className="admin-section">
          <div className="admin-toolbar">
            <div className="admin-filter-group">
              <input
                type="text"
                placeholder="Search members by name, phone, or shop…"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="admin-search-input"
                style={{ minWidth: 320 }}
              />
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
              Total Registered Members: <strong>{members.length}</strong>
            </div>
          </div>

          {(() => {
            const filteredMembers = members.filter((m) => {
              if (!memberSearchQuery.trim()) return true;
              const q = memberSearchQuery.toLowerCase();
              return (
                (m.name && m.name.toLowerCase().includes(q)) ||
                (m.phone && m.phone.includes(q)) ||
                (m.shopName && m.shopName.toLowerCase().includes(q))
              );
            });

            if (filteredMembers.length === 0) {
              return (
                <div className="state-msg empty-orders-state">
                  <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
                  <h3>No Member Profiles Found</h3>
                  <p>No customer profiles registered yet or matching search.</p>
                </div>
              );
            }

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {filteredMembers.map((m) => (
                  <div
                    key={m._id || m.phone}
                    onClick={() => handleViewMemberOrders(m)}
                    style={{
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      borderRadius: 14,
                      padding: 18,
                      boxShadow: '0 4px 12px rgba(43, 38, 32, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(43, 38, 32, 0.08)';
                      e.currentTarget.style.borderColor = 'var(--indigo)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(43, 38, 32, 0.04)';
                      e.currentTarget.style.borderColor = 'var(--line)';
                    }}
                    title="Click to view full order history"
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E8EDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            👤
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: 16, color: 'var(--indigo-deep)' }}>{m.name}</h4>
                            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{m.shopName || 'Wholesale Buyer'}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="card-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMember(m._id, m.name);
                          }}
                          title="Delete member profile"
                        >
                          🗑
                        </button>
                      </div>

                      <div style={{ fontSize: 13, color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
                        <div>📞 <strong>{m.phone}</strong></div>
                        {m.city && <div>📍 {m.city}</div>}
                        <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                          Joined: {new Date(m.createdAt || Date.now()).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const now = new Date();
                      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)).getTime();
                      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                      const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
                      const inRange = (d) => {
                        if (timeRange === 'all') return true;
                        if (!d) return false;
                        const dObj = new Date(d);
                        const t = dObj.getTime();
                        if (timeRange === 'day') return t >= startOfDay;
                        if (timeRange === 'week') return t >= startOfWeek;
                        if (timeRange === 'month') return t >= startOfMonth;
                        if (timeRange === 'year') return t >= startOfYear;
                        if (timeRange === 'custom' && customDate) {
                          const ordDate = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
                          return ordDate === customDate;
                        }
                        return true;
                      };

                      const periodOrders = orders.filter((o) => o.customerPhone === m.phone && inRange(o.createdAt));
                      const periodSpent = periodOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
                      const isFiltered = timeRange !== 'all';

                      return (
                        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 8 }}>
                            <div>
                              Orders: <strong>{isFiltered ? periodOrders.length : (m.orderCount ?? 0)}</strong>
                              {isFiltered && (
                                <span style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginLeft: 4 }}>
                                  ({m.orderCount ?? 0} total)
                                </span>
                              )}
                            </div>
                            <div style={{ color: '#2E7D32', fontWeight: 700 }}>
                              {isFiltered ? (
                                <>
                                  ₹{periodSpent.toLocaleString()}
                                  <span style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginLeft: 4, fontWeight: 400 }}>
                                    (₹{(m.totalSpent ?? 0).toLocaleString()} total)
                                  </span>
                                </>
                              ) : (
                                <>Total Spent: ₹{(m.totalSpent ?? 0).toLocaleString()}</>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewMemberOrders(m);
                            }}
                            style={{
                              width: '100%',
                              padding: '7px 12px',
                              borderRadius: 8,
                              border: '1px solid #D1D5DB',
                              background: '#F8F9FA',
                              color: 'var(--indigo-deep)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6
                            }}
                          >
                            📜 View Order History ({m.orderCount ?? 0}) →
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Edit Agency Modal */}
      {editingAgency && (
        <div className="modal-overlay" onClick={() => setEditingAgency(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Edit Agency</h3>
                <p>Modify agency details</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setEditingAgency(null)}>
                ✕
              </button>
            </div>
            <form className="modal-form" onSubmit={handleUpdateAgency}>
              <div className="form-grid modal-grid">
                <label>
                  Agency Name
                  <input
                    value={editAgencyData.name}
                    onChange={(e) => setEditAgencyData({ ...editAgencyData, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Category
                  <input
                    value={editAgencyData.category}
                    onChange={(e) => setEditAgencyData({ ...editAgencyData, category: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Icon
                  <select
                    value={editAgencyData.iconKey}
                    onChange={(e) => setEditAgencyData({ ...editAgencyData, iconKey: e.target.value })}
                  >
                    {Object.entries(AGENCY_ICONS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.emoji} {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Color Badge
                  <input
                    type="color"
                    value={editAgencyData.colorHex}
                    onChange={(e) => setEditAgencyData({ ...editAgencyData, colorHex: e.target.value })}
                  />
                </label>
              </div>
              <div className="form-actions" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setEditingAgency(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Edit Item Details</h3>
                <p>Modify stock specifications</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setEditingItem(null)}>
                ✕
              </button>
            </div>
            <form className="modal-form" onSubmit={handleUpdateItem}>
              <div className="form-grid modal-grid">
                <label>
                  Item Name
                  <input
                    value={editItemData.name}
                    onChange={(e) => setEditItemData({ ...editItemData, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Packaging Format
                  <select
                    value={editItemData.packagingType || 'box'}
                    onChange={(e) => setEditItemData({ ...editItemData, packagingType: e.target.value })}
                    required
                  >
                    <option value="box">📦 Box (Wholesale Carton)</option>
                    <option value="bag">🛍️ Bag (Sack / Bori)</option>
                  </select>
                </label>
                <label>
                  Units per {editItemData.packagingType === 'bag' ? 'Bag' : 'Box'}
                  <input
                    type="number"
                    min="1"
                    value={editItemData.unitsPerBox}
                    onChange={(e) => setEditItemData({ ...editItemData, unitsPerBox: e.target.value })}
                    required
                  />
                </label>
                <label>
                  {editItemData.packagingType === 'bag' ? 'Bags' : 'Boxes'} In Store
                  <input
                    type="number"
                    min="0"
                    value={editItemData.boxesInStock}
                    onChange={(e) => setEditItemData({ ...editItemData, boxesInStock: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Price per {editItemData.packagingType === 'bag' ? 'Bag' : 'Box'} (₹)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editItemData.pricePerBox}
                    onChange={(e) => setEditItemData({ ...editItemData, pricePerBox: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Low Stock Alert Threshold ({editItemData.packagingType === 'bag' ? 'bags' : 'boxes'})
                  <input
                    type="number"
                    min="0"
                    value={editItemData.lowStockThreshold}
                    onChange={(e) => setEditItemData({ ...editItemData, lowStockThreshold: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="form-actions" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Order History Modal */}
      {selectedMemberForOrders && (
        <div className="modal-overlay" onClick={() => setSelectedMemberForOrders(null)}>
          <div
            className="modal-dialog"
            style={{ maxWidth: 840, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#E8EDF8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22
                  }}
                >
                  👤
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, color: 'var(--indigo-deep)' }}>
                    {selectedMemberForOrders.member.name}
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                    {selectedMemberForOrders.member.shopName ? `${selectedMemberForOrders.member.shopName} • ` : ''}
                    📞 {selectedMemberForOrders.member.phone}
                    {selectedMemberForOrders.member.city ? ` • 📍 ${selectedMemberForOrders.member.city}` : ''}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedMemberForOrders(null)}
              >
                ✕
              </button>
            </div>

            {/* Quick stats summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12,
                marginBottom: 18,
                background: '#F8F6F0',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--line)'
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Orders
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--indigo-deep)' }}>
                  {selectedMemberForOrders.orders.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Lifetime Spent
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#2E7D32' }}>
                  ₹
                  {selectedMemberForOrders.orders
                    .reduce((sum, o) => sum + (o.grandTotal || 0), 0)
                    .toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Actions
                </div>
                <button
                  type="button"
                  style={{
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: '1px solid var(--indigo)',
                    background: 'var(--indigo)',
                    color: '#fff',
                    cursor: 'pointer',
                    marginTop: 2
                  }}
                  onClick={() => {
                    const phone = selectedMemberForOrders.member.phone;
                    setSelectedMemberForOrders(null);
                    setTab('orders');
                    setOrderSearchQuery(phone);
                  }}
                >
                  View in Orders Tab ↗
                </button>
              </div>
            </div>

            {/* Orders list */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              {loadingMemberOrders ? (
                <div className="state-msg" style={{ padding: '40px 0' }}>
                  Loading member orders…
                </div>
              ) : selectedMemberForOrders.orders.length === 0 ? (
                <div className="state-msg empty-orders-state" style={{ padding: '30px 0' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                  <h3>No Orders Found</h3>
                  <p>This member has not placed any wholesale orders yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {selectedMemberForOrders.orders.map((ord) => {
                    const statusColors = {
                      confirmed: { bg: '#E3F2FD', color: '#1565C0', label: '✓ Confirmed' },
                      dispatched: { bg: '#FFF8E1', color: '#F57F17', label: '🚚 Dispatched' },
                      delivered: { bg: '#E8F5E9', color: '#2E7D32', label: '★ Delivered' },
                      cancelled: { bg: '#FFEBEE', color: '#C62828', label: '✕ Cancelled' }
                    };
                    const st = statusColors[ord.status] || statusColors.confirmed;

                    return (
                      <div
                        key={ord._id || ord.orderId}
                        style={{
                          background: '#fff',
                          border: '1px solid var(--line)',
                          borderRadius: 12,
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            padding: '10px 16px',
                            background: '#FDFCF7',
                            borderBottom: '1px solid var(--line)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 8
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontFamily: 'Bitter', fontWeight: 800, fontSize: 15, color: 'var(--indigo-deep)' }}>
                              {ord.orderId}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: st.bg,
                                color: st.color,
                                textTransform: 'uppercase'
                              }}
                            >
                              {st.label}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                              {new Date(ord.createdAt).toLocaleString('en-GB')}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <select
                              value={ord.status || 'confirmed'}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                await handleAdminOrderStatus(ord.orderId || ord._id, newStatus);
                                setSelectedMemberForOrders((prev) => ({
                                  ...prev,
                                  orders: prev.orders.map((o) =>
                                    o.orderId === ord.orderId || o._id === ord._id ? { ...o, status: newStatus } : o
                                  )
                                }));
                              }}
                              className="admin-select"
                              style={{ fontSize: 11, padding: '3px 6px' }}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            <button
                              type="button"
                              className="card-delete-btn"
                              onClick={async () => {
                                await handleAdminDeleteOrder(ord.orderId || ord._id);
                                setSelectedMemberForOrders((prev) => ({
                                  ...prev,
                                  orders: prev.orders.filter((o) => o.orderId !== ord.orderId && o._id !== ord._id)
                                }));
                              }}
                              title="Delete this order"
                            >
                              🗑
                            </button>
                          </div>
                        </div>

                        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                          <div style={{ flex: 2, minWidth: 260 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo-deep)', marginBottom: 6 }}>
                              📦 Ordered Items ({ord.items ? ord.items.length : 0}):
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {ord.items &&
                                ord.items.map((it, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      fontSize: 12.5,
                                      borderBottom: '1px dashed var(--line)',
                                      paddingBottom: 4
                                    }}
                                  >
                                    <div>
                                      <strong>{it.name}</strong>{' '}
                                      <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                                        ({it.agencyName})
                                      </span>
                                      <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                                        {it.buyType === 'unit'
                                          ? `${it.unitsBought} pcs @ ₹${it.rate}/pc`
                                          : `${it.boxesBought} ${it.packagingType === 'bag' ? (it.boxesBought === 1 ? 'bag' : 'bags') : (it.boxesBought === 1 ? 'box' : 'boxes')} (${it.unitsBought} pcs) @ ₹${it.rate}/${it.packagingType === 'bag' ? 'bag' : 'box'}`}
                                      </div>
                                    </div>
                                    <div style={{ fontWeight: 700 }}>₹{(it.subtotal || 0).toLocaleString()}</div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', minWidth: 140 }}>
                            <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Grand Total</div>
                            <div style={{ fontFamily: 'Bitter', fontWeight: 800, fontSize: 18, color: 'var(--brick)' }}>
                              ₹{(ord.grandTotal || 0).toLocaleString()}
                            </div>
                            {ord.notes && (
                              <div
                                style={{
                                  marginTop: 6,
                                  fontSize: 11,
                                  background: '#F8F5EE',
                                  padding: '4px 8px',
                                  borderRadius: 6,
                                  textAlign: 'left'
                                }}
                              >
                                <strong>Note:</strong> {ord.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="form-actions" style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setSelectedMemberForOrders(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Admin PIN Modal */}
      {showChangePinModal && (
        <div className="modal-overlay" onClick={() => !pinChangeLoading && setShowChangePinModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>🔐</span>
              <h2 style={{ fontFamily: 'Bitter, serif', fontSize: '20px', margin: 0, color: 'var(--indigo-deep)' }}>
                Change Admin Passcode
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '18px' }}>
              Update your administrative PIN to protect warehouse operations and customer orders.
            </p>

            {pinChangeError && (
              <div className="form-error" style={{ marginBottom: '14px' }}>
                ⚠️ {pinChangeError}
              </div>
            )}

            {pinChangeSuccess && (
              <div
                style={{
                  background: '#EAF7EE',
                  color: '#1E7E34',
                  border: '1px solid #C3E6CB',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ✅ {pinChangeSuccess}
              </div>
            )}

            <form onSubmit={handleChangePinSubmit}>
              {/* Current PIN */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--indigo-deep)', marginBottom: '4px' }}>
                  Current Passcode
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showOldPin ? 'text' : 'password'}
                    className="styled-input-sm"
                    style={{ paddingRight: '42px' }}
                    placeholder="Enter current PIN"
                    value={pinForm.currentPin}
                    onChange={(e) => setPinForm({ ...pinForm, currentPin: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPin((prev) => !prev)}
                    title={showOldPin ? 'Hide' : 'Show'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    {showOldPin ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              {/* New PIN */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--indigo-deep)', marginBottom: '4px' }}>
                  New Passcode (min. 6 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    className="styled-input-sm"
                    style={{ paddingRight: '42px' }}
                    placeholder="Enter new PIN"
                    value={pinForm.newPin}
                    onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin((prev) => !prev)}
                    title={showNewPin ? 'Hide' : 'Show'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    {showNewPin ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              {/* Confirm PIN */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--indigo-deep)', marginBottom: '4px' }}>
                  Confirm New Passcode
                </label>
                <input
                  type={showNewPin ? 'text' : 'password'}
                  className="styled-input-sm"
                  placeholder="Repeat new PIN"
                  value={pinForm.confirmPin}
                  onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={pinChangeLoading}
                  onClick={() => setShowChangePinModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={pinChangeLoading}
                >
                  {pinChangeLoading ? 'Updating…' : 'Save New Passcode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
