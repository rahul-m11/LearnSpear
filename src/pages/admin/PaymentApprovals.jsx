import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  User,
  BookOpen,
  Shield,
  Search,
  Filter,
  Eye,
  X,
  AlertTriangle,
  Smartphone,
  CreditCard,
  Calendar,
  Hash,
  ChevronDown,
} from 'lucide-react';

const PaymentApprovals = () => {
  const { payments, approvePayment, rejectPayment, courses, users, getCourseById } = useApp();
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);

  const filteredPayments = payments
    .filter(p => {
      if (filter === 'all') return true;
      return p.status === filter;
    })
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (p.userName || '').toLowerCase().includes(q) ||
        (p.userEmail || '').toLowerCase().includes(q) ||
        (p.transactionRef || '').includes(q) ||
        (p.courseTitle || '').toLowerCase().includes(q) ||
        (p.transactionId || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const completedCount = payments.filter(p => p.status === 'completed').length;
  const rejectedCount = payments.filter(p => p.status === 'rejected').length;

  const handleApprove = (paymentId) => {
    approvePayment(paymentId);
  };

  const handleRejectClick = (paymentId) => {
    setRejectingId(paymentId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (rejectingId) {
      rejectPayment(rejectingId, rejectReason || 'Payment not received');
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason('');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Payment Approvals
          </h1>
          <p className="text-sm text-gray-500 mt-1">Verify and approve student payments to unlock their courses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilter('pending')}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
            filter === 'pending' ? 'border-amber-400 bg-amber-50 shadow-lg shadow-amber-100' : 'border-gray-100 bg-white hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div
          onClick={() => setFilter('completed')}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
            filter === 'completed' ? 'border-green-400 bg-green-50 shadow-lg shadow-green-100' : 'border-gray-100 bg-white hover:border-green-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-600">{completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div
          onClick={() => setFilter('rejected')}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
            filter === 'rejected' ? 'border-red-400 bg-red-50 shadow-lg shadow-red-100' : 'border-gray-100 bg-white hover:border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, UTR, or course..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
        />
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IndianRupee className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No {filter === 'all' ? '' : filter} payments</h3>
          <p className="text-gray-400 text-sm">
            {filter === 'pending' ? 'No payments waiting for verification' : `No ${filter} payments found`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => {
            const course = getCourseById(payment.courseId);
            return (
              <div
                key={payment.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md ${
                  payment.status === 'pending' ? 'border-amber-200 shadow-sm' : 'border-gray-100'
                }`}
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Payment Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {course && (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 truncate">{payment.courseTitle}</h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {payment.userName || 'Unknown User'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(payment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            {payment.method === 'upi' ? <Smartphone className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                            {payment.method === 'upi' ? 'UPI' : 'Card'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm">
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <Hash className="w-3.5 h-3.5 text-gray-400" />
                            UTR: <span className="font-mono font-bold">{payment.transactionRef || 'N/A'}</span>
                          </span>
                          <span className="flex items-center gap-1.5 font-bold text-gray-900">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {payment.amount?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {payment.status === 'rejected' && payment.rejectReason && (
                          <p className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg inline-block">
                            Reason: {payment.rejectReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    {payment.status === 'pending' && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApprove(payment.id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(payment.id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all text-sm border border-red-200"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                    {payment.status === 'completed' && (
                      <div className="text-xs text-green-600 font-medium">
                        Approved {payment.approvedAt ? new Date(payment.approvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Reject Payment</h3>
                <p className="text-sm text-gray-500">This will notify the student</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Payment not received, Wrong amount, Invalid UTR..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all text-sm resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectingId(null); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
              >
                Reject Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentApprovals;
