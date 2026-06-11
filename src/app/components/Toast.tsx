import React, { useEffect, useState, useCallback } from 'react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

const ICONS = {
  success: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
  ),
  error: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
  ),
  warning: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  info: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
  ),
};

const COLORS = {
  success: { bg: 'var(--success-bg)', border: 'var(--success-border)', text: 'var(--success)', icon: 'var(--success)' },
  error: { bg: 'var(--danger-bg)', border: 'var(--danger-border)', text: 'var(--danger)', icon: 'var(--danger)' },
  warning: { bg: 'var(--warning-bg)', border: 'var(--warning-border)', text: 'var(--warning)', icon: 'var(--warning)' },
  info: { bg: 'var(--info-bg)', border: 'var(--info-border)', text: 'var(--info)', icon: 'var(--info)' },
};

let toastIdCounter = 0;

// Module-level toast queue
let listeners: Array<(items: ToastItem[]) => void> = [];
let toastItems: ToastItem[] = [];

function notifyListeners() {
  listeners.forEach(l => l([...toastItems]));
}

export function showToast(type: ToastItem['type'], message: string, duration = 3000) {
  const id = `toast-${++toastIdCounter}-${Date.now()}`;
  const item: ToastItem = { id, type, message, duration };
  toastItems = [...toastItems, item];
  notifyListeners();
  if (duration > 0) {
    setTimeout(() => {
      toastItems = toastItems.filter(t => t.id !== id);
      notifyListeners();
    }, duration);
  }
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (newItems: ToastItem[]) => setItems(newItems);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {items.map(item => {
        const c = COLORS[item.type];
        return (
          <div
            key={item.id}
            className="pointer-events-auto rounded-lg px-4 py-3 flex items-center gap-2.5 shadow-lg animate-fade-in-up"
            style={{ backgroundColor: 'var(--bg-surface)', border: `1px solid ${c.border}`, boxShadow: 'var(--shadow-modal)', maxWidth: '380px' }}
          >
            <span style={{ color: c.icon }}>{ICONS[item.type]}</span>
            <span className="text-[13px] flex-1" style={{ color: 'var(--text-primary)' }}>{item.message}</span>
          </div>
        );
      })}
    </div>
  );
}
