import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const ReceiptModal = ({ order, onClose }) => {
  const receiptRef = useRef(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadPDF = async () => {
    try {
      // Mark receipt as generated
      await api.put(`/orders/${order._id}/receipt`);

      // Create a printable version
      const printWindow = window.open('', '_blank');
      const receiptHTML = receiptRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${order.orderNumber}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
              }
              body {
                font-family: Arial, sans-serif;
                max-width: 400px;
                margin: 0 auto;
                padding: 20px;
                background: white;
                color: #1A0F0A;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #FF8C00;
                padding-bottom: 15px;
                margin-bottom: 20px;
              }
              .header h1 {
                color: #FF8C00;
                margin: 0;
                font-size: 24px;
              }
              .order-info {
                margin-bottom: 20px;
              }
              .order-info p {
                margin: 5px 0;
                font-size: 14px;
              }
              .items {
                margin: 20px 0;
              }
              .item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #ddd;
              }
              .item-name {
                flex: 1;
              }
              .item-qty {
                margin: 0 10px;
              }
              .totals {
                margin-top: 20px;
                border-top: 2px solid #FF8C00;
                padding-top: 15px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            ${receiptHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt. You can still print this page.');
    }
  };

  const estimatedReadyTime = order.estimatedPrepTime
    ? new Date(new Date(order.createdAt).getTime() + order.estimatedPrepTime * 60000)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-coffee-darker border-2 border-coffee-amber rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={receiptRef} className="text-coffee-cream">
          {/* Header */}
          <div className="text-center border-b-2 border-coffee-amber pb-4 mb-6">
            <h1 className="text-3xl font-heading font-bold text-coffee-amber mb-2">
              Rabuste Coffee
            </h1>
            <p className="text-sm text-coffee-light">Digital Receipt</p>
          </div>

          {/* Order Info */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-coffee-light">Order Number:</span>
              <span className="font-semibold text-coffee-amber">{order.orderNumber}</span>
            </div>
            {order.tokenNumber && order.tokenNumber > 0 && (
              <div className="flex justify-between">
                <span className="text-coffee-light">Token:</span>
                <span className="font-semibold text-coffee-amber">#{order.tokenNumber}</span>
              </div>
            )}
            {order.tableNumber && (
              <div className="flex justify-between">
                <span className="text-coffee-light">Table:</span>
                <span className="font-semibold text-coffee-cream">{order.tableNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-coffee-light">Source:</span>
              <span className="font-semibold text-coffee-cream">{order.orderSource || 'QR'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-light">Date & Time:</span>
              <span className="text-coffee-cream">{formatDate(order.createdAt)}</span>
            </div>
            {estimatedReadyTime && (
              <div className="flex justify-between">
                <span className="text-coffee-light">Est. Ready Time:</span>
                <span className="text-coffee-amber font-semibold">
                  {formatDate(estimatedReadyTime)}
                </span>
              </div>
            )}
            {order.status && (
              <div className="flex justify-between">
                <span className="text-coffee-light">Status:</span>
                <span className={`font-semibold ${
                  order.status === 'Completed' ? 'text-green-400' :
                  order.status === 'Preparing' ? 'text-yellow-400' :
                  'text-coffee-amber'
                }`}>
                  {order.status}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-coffee-light">Payment:</span>
              <span className={`font-semibold ${
                order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {order.paymentStatus || 'Pending'} {order.paymentStatus === 'Paid' && `(${order.paymentMethod || 'Cash'})`}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-lg font-heading font-bold text-coffee-amber mb-3">Items</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start pb-2 border-b border-coffee-brown/30">
                  <div className="flex-1">
                    <p className="text-coffee-cream font-medium">{item.name}</p>
                    {item.priceType !== 'Standard' && (
                      <p className="text-xs text-coffee-light">{item.priceType}</p>
                    )}
                    <p className="text-xs text-coffee-light">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-coffee-amber font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-coffee-amber pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-coffee-light">Subtotal:</span>
              <span className="text-coffee-cream">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-light">Tax (5%):</span>
              <span className="text-coffee-cream">₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t border-coffee-brown/30">
              <span className="text-coffee-amber">Total:</span>
              <span className="text-coffee-amber">₹{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-6 pt-4 border-t border-coffee-brown/30">
              <p className="text-sm text-coffee-light">
                <span className="font-semibold">Notes:</span> {order.notes}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-coffee-brown/30 text-center text-xs text-coffee-light">
            <p>Thank you for choosing Rabuste Coffee!</p>
            <p className="mt-2">Visit us again soon ☕</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={downloadPDF}
            className="flex-1 bg-coffee-amber text-coffee-darker py-2 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-coffee-brown/40 text-coffee-cream py-2 rounded-lg font-semibold hover:bg-coffee-brown/60 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReceiptModal;

