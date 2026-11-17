import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function AlertNotification({ type = 'info', title, message, onClose }) {
  if (!message) return null;


  const alertClass = type === 'error' ? 'danger' : type;

  return (
    <div className={`alert-banner ${alertClass}`}>
      <div style={{ flexShrink: 0 }}>
        {icons[type] || icons.info}
      </div>
      <div className="alert-banner-content">
        {title && <div className="alert-banner-title">{title}</div>}
        <div className="alert-banner-desc">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="btn-icon-only"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
