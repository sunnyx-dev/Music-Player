import { useState, useEffect } from 'react';

let toastId = 0;
const listeners = new Set();
const toasts = [];

export function showToast(message, type = 'info') {
  const t = { id: ++toastId, message, type };
  toasts.push(t);
  listeners.forEach(fn => fn([...toasts]));
  setTimeout(() => {
    const idx = toasts.findIndex(x => x.id === t.id);
    if (idx >= 0) toasts.splice(idx, 1);
    listeners.forEach(fn => fn([...toasts]));
  }, 3000);
}

export default function ToastContainer() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    listeners.add(setItems);
    return () => listeners.delete(setItems);
  }, []);

  return (
    <div className="toast-container">
      {items.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}
