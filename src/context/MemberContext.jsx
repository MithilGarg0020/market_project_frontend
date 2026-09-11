import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const MemberContext = createContext(null);

const STORAGE_KEY = 'karyana_member_profile_v1';

export function MemberProvider({ children }) {
  const [member, setMember] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            name: '',
            shopName: '',
            phone: ''
          };
    } catch {
      return { name: '', shopName: '', phone: '' };
    }
  });

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (member.name || member.phone || member.shopName) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist member profile', e);
    }
  }, [member]);

  function updateMember(profile) {
    setMember((prev) => ({ ...prev, ...profile }));
  }

  const isMemberConfigured = Boolean(member.name && member.phone);
  const [hasPlacedOrders, setHasPlacedOrders] = useState(() => {
    try {
      return localStorage.getItem('karyana_member_has_orders_v1') === 'true';
    } catch {
      return false;
    }
  });

  // Check if member has placed orders whenever phone number changes or mounts
  useEffect(() => {
    let isMounted = true;
    if (member && member.phone && member.phone.trim()) {
      api.getOrders({ phone: member.phone.trim(), limit: 1 })
        .then((res) => {
          if (!isMounted) return;
          const hasAny = Array.isArray(res) && res.length > 0;
          setHasPlacedOrders(hasAny);
          try {
            localStorage.setItem('karyana_member_has_orders_v1', String(hasAny));
          } catch (e) {
            // ignore
          }
        })
        .catch((err) => {
          console.warn('Could not check member orders:', err.message);
        });
    } else {
      setHasPlacedOrders(false);
      try {
        localStorage.removeItem('karyana_member_has_orders_v1');
      } catch (e) {
        // ignore
      }
    }
    return () => {
      isMounted = false;
    };
  }, [member?.phone]);

  function markOrderPlaced() {
    setHasPlacedOrders(true);
    try {
      localStorage.setItem('karyana_member_has_orders_v1', 'true');
    } catch (e) {
      // ignore
    }
  }

  function clearMember() {
    localStorage.removeItem(STORAGE_KEY);
    try {
      localStorage.removeItem('karyana_member_has_orders_v1');
    } catch (e) {
      // ignore
    }
    setMember({ name: '', shopName: '', phone: '' });
    setHasPlacedOrders(false);
  }

  return (
    <MemberContext.Provider
      value={{
        member,
        updateMember,
        clearMember,
        isMemberConfigured,
        hasPlacedOrders,
        markOrderPlaced,
        setHasPlacedOrders,
        isMemberModalOpen,
        setIsMemberModalOpen
      }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  return context;
}
