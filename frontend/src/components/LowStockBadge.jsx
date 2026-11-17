import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function LowStockBadge({ availableQuantity }) {
  const qty = parseInt(availableQuantity, 10);

  if (qty <= 0) {
    return (
      <span className="stock-badge out-of-stock" title="This book is currently out of stock">
        <XCircle size={13} />
        Out of Stock (0)
      </span>
    );
  }

  if (qty < 2) {
    return (
      <span className="stock-badge low-stock" title="Low stock alert! Fewer than 2 copies available">
        <AlertTriangle size={13} />
        Low Stock ({qty} left)
      </span>
    );
  }

  return (
    <span className="stock-badge in-stock" title="Book is available for borrowing">
      <CheckCircle2 size={13} />
      In Stock ({qty})
    </span>
  );
}
