import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Phone, MapPin, Calendar, ZoomIn, ZoomOut, Maximize2, 
  ChevronLeft, FileText, LayoutGrid, MessageSquare, Clock, ShieldAlert,
  CheckCircle2, AlertCircle, PlayCircle, ClipboardCheck
} from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import BlueprintDrawing from './BlueprintDrawing';

export default function OrderDetails({ order, isAdmin, onBack, onStatusChange, updating }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [remarks, setRemarks] = useState(order.remarks || '');

  // Keep local remarks in sync if order prop changes
  useEffect(() => {
    setRemarks(order.remarks || '');
  }, [order.remarks]);
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine status history checklist
  const getStatusHistory = () => {
    const history = [
      { 
        status: 'Pending', 
        label: 'Order Placed', 
        description: 'Your blueprint order has been successfully placed.',
        date: order.orderDate || order.createdAt,
        active: true,
        done: true 
      }
    ];

    const currentStatus = order.status;
    const isUnderReview = ['In Review', 'Processing', 'Approved', 'Rejected', 'Completed'].includes(currentStatus);
    const isApprovedOrRejected = ['Approved', 'Rejected', 'Completed'].includes(currentStatus);
    const isCompleted = currentStatus === 'Completed';

    history.push({
      status: 'In Review',
      label: 'Under Review',
      description: 'Our engineering staff is reviewing your drawing specifications.',
      date: isUnderReview ? (order.updatedAt || order.createdAt) : null,
      active: currentStatus === 'In Review' || currentStatus === 'Processing',
      done: isUnderReview
    });

    if (currentStatus === 'Rejected') {
      history.push({
        status: 'Rejected',
        label: 'Rejected',
        description: 'Design rejected. Please check admin comments for details.',
        date: order.updatedAt,
        active: true,
        done: true,
        isError: true
      });
    } else {
      history.push({
        status: 'Approved',
        label: 'Approved',
        description: 'Design approved. Preparing finalized drawings for delivery.',
        date: isApprovedOrRejected ? order.updatedAt : null,
        active: currentStatus === 'Approved',
        done: isApprovedOrRejected
      });

      history.push({
        status: 'Completed',
        label: 'Completed',
        description: 'Order completed. Blueprint deliverables are ready.',
        date: isCompleted ? order.updatedAt : null,
        active: currentStatus === 'Completed',
        done: isCompleted
      });
    }

    return history;
  };

  const historySteps = getStatusHistory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-gray-600"
            title="Back to Orders"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-gray-400">Order Details</div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mt-0.5">
              {order.id}
              <OrderStatusBadge status={order.status} />
            </h2>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">Status:</span>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value, remarks)}
              disabled={updating}
              className="w-full sm:w-40 rounded-lg border border-gray-200 py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold disabled:opacity-55"
            >
              <option value="Pending">Pending</option>
              <option value="In Review">In Review</option>
              <option value="Processing">Processing (Blue)</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Metadata & Remarks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer info */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-indigo-500" /> Customer Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 block text-xs">Customer Name</span>
                <span className="font-semibold text-gray-700">{order.customerName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Email Address</span>
                <span className="font-medium text-gray-700 break-all">{order.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Phone Number</span>
                <span className="font-medium text-gray-700">{order.phone || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs flex items-center gap-1">
                  <MapPin size={12} /> Billing/Delivery Address
                </span>
                <span className="font-medium text-gray-600 leading-relaxed block mt-0.5">{order.address || '—'}</span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" /> Order Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 block text-xs">Product Name/Title</span>
                <span className="font-semibold text-gray-700">{order.productName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 block text-xs">Quantity</span>
                  <span className="font-semibold text-gray-700">{order.quantity} unit(s)</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Created Date</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">Total Price</span>
                <span className="text-lg font-extrabold text-indigo-600">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Admin remarks / feedback section */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-500" /> Reviewer Remarks
            </h3>
            
            {isAdmin ? (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks or feedback for the user..."
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium text-gray-700"
                />
                <button
                  onClick={() => onStatusChange(order.id, order.status, remarks)}
                  disabled={updating || remarks === (order.remarks || '')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
                >
                  {updating ? 'Saving remarks...' : 'Save Remarks'}
                </button>
              </div>
            ) : (
              <div className="text-sm">
                {order.remarks ? (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-indigo-900 leading-relaxed relative">
                    <span className="absolute -top-2 left-6 text-[10px] font-bold text-indigo-500 bg-white px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                      Admin Message
                    </span>
                    <p className="text-gray-700 font-medium text-sm mt-1">{order.remarks}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-center py-4">No comments or feedback added by reviewers yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Status timeline for user side */}
          {!isAdmin && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-5">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" /> Tracking Timeline
              </h3>
              
              <div className="relative border-l-2 border-gray-100 ml-3.5 pl-6 space-y-6">
                {historySteps.map((step, idx) => {
                  let iconBg = 'bg-gray-100 text-gray-400';
                  let icon = <AlertCircle size={14} />;

                  if (step.done) {
                    if (step.isError) {
                      iconBg = 'bg-red-500 text-white';
                      icon = <ShieldAlert size={14} />;
                    } else {
                      iconBg = 'bg-indigo-600 text-white';
                      icon = <CheckCircle2 size={14} />;
                    }
                  } else if (step.active) {
                    iconBg = 'bg-blue-500 text-white animate-pulse';
                    icon = <PlayCircle size={14} />;
                  }

                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${iconBg}`}>
                        {icon}
                      </span>
                      
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${step.done ? 'text-gray-800' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                        <p className={`text-xs mt-0.5 leading-relaxed ${step.done ? 'text-gray-500' : 'text-gray-400'}`}>
                          {step.description}
                        </p>
                        {step.date && (
                          <span className="text-[10px] font-semibold text-gray-400 mt-1 flex items-center gap-1">
                            <Clock size={10} /> {formatDate(step.date)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: CAD/Design Preview */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden h-full flex flex-col">
            
            {/* Drawing Toolbar */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 whitespace-nowrap">
                <LayoutGrid size={16} className="text-indigo-500" /> Blueprint Preview
              </h3>

              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                  className="p-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} /> <span className="hidden sm:inline">Zoom Out</span>
                </button>
                <span className="px-2 py-2 text-xs font-mono font-bold text-gray-600 flex items-center justify-center min-w-[45px]">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                  className="p-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Zoom In"
                >
                  <ZoomIn size={14} /> <span className="hidden sm:inline">Zoom In</span>
                </button>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Fullscreen Preview"
                >
                  <Maximize2 size={14} /> <span className="hidden sm:inline">Fullscreen</span>
                </button>
              </div>
            </div>

            {/* SVG Drawing Area */}
            <div className="flex-1 bg-slate-950 min-h-[350px] relative overflow-hidden flex items-center justify-center p-4">
              <div
                className="w-full max-w-[450px] aspect-[4/3] rounded-lg overflow-hidden border border-slate-800 shadow-2xl transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
              >
                <BlueprintDrawing type={order.blueprintType} drawingData={order.drawingData} />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Fullscreen Modal via React Portal to prevent layout stacking context overlay */}
      {isFullscreen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 text-white shrink-0">
            <div>
              <h3 className="font-semibold text-base">{order.productName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Fullscreen View • Drawing ID: {order.id}</p>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Close Fullscreen"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative flex items-center justify-center p-6 bg-slate-950">
            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex gap-2 z-10 bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-2xl backdrop-blur-sm">
              <button
                onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ZoomOut size={16} />
              </button>
              <span className="px-3 text-xs font-mono font-bold text-slate-200 flex items-center justify-center min-w-[60px]">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(300, prev + 25))}
                className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            <div
              className="w-full max-w-[800px] aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-slate-800 transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
            >
              <BlueprintDrawing type={order.blueprintType} drawingData={order.drawingData} />
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
