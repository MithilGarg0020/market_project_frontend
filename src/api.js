const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const adminKey = localStorage.getItem('karyana_admin_pin') || '';
  const headers = {
    'Content-Type': 'application/json',
    ...(adminKey ? { 'x-admin-key': adminKey } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getAgencies: () => request('/agencies'),
  getAgency: (id) => request(`/agencies/${id}`),
  createAgency: (data) => request('/agencies', { method: 'POST', body: JSON.stringify(data) }),
  updateAgency: (id, data) => request(`/agencies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAgency: (id) => request(`/agencies/${id}`, { method: 'DELETE' }),

  getItems: (agencyId) => request(`/items${agencyId ? `?agency=${agencyId}` : ''}`),
  createItem: (data) => request('/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, data) => request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),
  restockItem: (id, boxesAdded) =>
    request(`/items/${id}/restock`, { method: 'PATCH', body: JSON.stringify({ boxesAdded }) }),
  dispatchItem: (id, boxesRemoved) =>
    request(`/items/${id}/dispatch`, { method: 'PATCH', body: JSON.stringify({ boxesRemoved }) }),
  buyItem: (id, quantity, buyType = 'box', notes = '', customer = {}) =>
    request(`/items/${id}/buy`, {
      method: 'POST',
      body: JSON.stringify({
        buyType,
        quantity,
        boxes: buyType === 'box' ? quantity : undefined,
        units: buyType === 'unit' ? quantity : undefined,
        notes,
        customerName: customer.name || 'Guest Member',
        shopName: customer.shopName || '',
        customerPhone: customer.phone || ''
      })
    }),
  checkoutCart: (items, notes = '', customer = {}) =>
    request('/items/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items,
        notes,
        customerName: customer.name || 'Guest Member',
        shopName: customer.shopName || '',
        customerPhone: customer.phone || ''
      })
    }),

  // Orders endpoints
  getOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.phone) query.append('phone', params.phone);
    if (params.name) query.append('name', params.name);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString();
    return request(`/orders${qs ? `?${qs}` : ''}`);
  },
  getOrder: (orderId) => request(`/orders/${orderId}`),
  updateOrderStatus: (orderId, status) =>
    request(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  migrateOrders: (data) =>
    request('/orders/migrate-phone', { method: 'POST', body: JSON.stringify(data) }),
  clearOrders: (phone = '') => {
    const query = phone ? `?phone=${encodeURIComponent(phone.trim())}` : '';
    return request(`/orders${query}`, { method: 'DELETE' });
  },

  // Admin specific endpoints
  adminVerifyPin: (pin) =>
    request('/admin/verify', { method: 'POST', body: JSON.stringify({ pin }) }),
  adminChangePin: (currentPin, newPin) =>
    request('/admin/change-pin', { method: 'POST', body: JSON.stringify({ currentPin, newPin }) }),
  adminGetStats: () => request('/admin/stats'),
  adminCreateAgency: (data) =>
    request('/admin/agencies', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateAgency: (id, data) =>
    request(`/admin/agencies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteAgency: (id) =>
    request(`/admin/agencies/${id}`, { method: 'DELETE' }),
  adminCreateItem: (data) =>
    request('/admin/items', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateItem: (id, data) =>
    request(`/admin/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteItem: (id) =>
    request(`/admin/items/${id}`, { method: 'DELETE' }),
  adminRestockItem: (id, boxesAdded) =>
    request(`/admin/items/${id}/restock`, { method: 'PATCH', body: JSON.stringify({ boxesAdded }) }),
  adminDispatchItem: (id, boxesRemoved) =>
    request(`/admin/items/${id}/dispatch`, { method: 'PATCH', body: JSON.stringify({ boxesRemoved }) }),
  adminGetOrders: () => request('/admin/orders'),
  adminUpdateOrderStatus: (orderId, status) =>
    request(`/admin/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminUpdateOrder: (orderId, data) =>
    request(`/admin/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminDeleteOrder: (orderId) =>
    request(`/admin/orders/${orderId}`, { method: 'DELETE' }),
  adminClearOrders: () =>
    request('/admin/orders', { method: 'DELETE' }),

  // Members API
  getMembers: (search = '') => {
    const qs = search ? `?search=${encodeURIComponent(search.trim())}` : '';
    return request(`/members${qs}`);
  },
  getMemberDetails: (phone) =>
    request(`/members/${encodeURIComponent(phone)}`),
  saveMember: (data) =>
    request('/members', { method: 'POST', body: JSON.stringify(data) }),
  deleteMember: (id) =>
    request(`/members/${id}`, { method: 'DELETE' })
};

