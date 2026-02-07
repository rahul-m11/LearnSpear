import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  BookOpen,
  Clock,
  Users,
  Award,
  Zap,
  Star,
  Tag,
  Percent,
  X,
  Smartphone,
  Building2,
  Wallet,
  BadgeCheck,
  Gift,
  ChevronRight,
  Sparkles,
  Timer,
  QrCode,
  ExternalLink,
  IndianRupee,
  Copy,
  Check,
} from 'lucide-react';

const RECEIVER_UPI = 'itz.rm11085@oksbi';
const RECEIVER_NAME = 'LearnSphere';

const Payment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, getCourseById, getEnrollment, enrollCourse, addPayment, checkUTR, getPendingPayment, getUserPaymentForCourse } = useApp();

  const course = getCourseById(parseInt(courseId));
  const enrollment = user ? getEnrollment(user.id, parseInt(courseId)) : null;
  const pendingPayment = user ? getPendingPayment(user.id, parseInt(courseId)) : null;
  const userPayments = user ? getUserPaymentForCourse(user.id, parseInt(courseId)) : [];

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [verificationStep, setVerificationStep] = useState(0);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);


  // Card form
  const [cardForm, setCardForm] = useState({
    name: user?.name || '',
    number: '',
    expiry: '',
    cvv: '',
  });

  // UPI form
  const [upiId, setUpiId] = useState('');

  // Errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) navigate('/login');
    if (!course) navigate('/courses');
    if (enrollment) {
      navigate(`/courses/${courseId}`);
    }
  }, [user, course, enrollment]);

  if (!course || !user) return null;

  const isFree = !course.price || course.price === 0 || course.access === 'free';
  const originalPrice = course.price || 0;
  const discount = couponApplied ? couponDiscount : 0;
  const finalPrice = Math.max(originalPrice - discount, 0);
  const tax = Math.round(finalPrice * 0.18);
  const totalAmount = finalPrice + tax;

  // Coupon codes
  const VALID_COUPONS = {
    LEARN20: { discount: 20, type: 'percent', label: '20% off' },
    FIRST50: { discount: 50, type: 'flat', label: '\u20B950 flat off' },
    WELCOME50: { discount: 50, type: 'percent', label: '50% off' },
    NEWYEAR: { discount: 100, type: 'flat', label: '\u20B9100 flat off' },
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    setCouponError('');
    if (!code) return;

    const coupon = VALID_COUPONS[code];
    if (!coupon) {
      setCouponError('Invalid coupon code');
      setCouponApplied(false);
      setCouponDiscount(0);
      return;
    }

    const discountAmt =
      coupon.type === 'percent' ? Math.round((originalPrice * coupon.discount) / 100) : coupon.discount;
    setCouponDiscount(discountAmt);
    setCouponApplied(true);
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponError('');
  };

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validateCard = () => {
    const errs = {};
    if (!cardForm.name.trim()) errs.name = 'Name is required';
    const digits = cardForm.number.replace(/\s/g, '');
    if (digits.length < 16) errs.number = 'Enter a valid 16-digit card number';
    if (cardForm.expiry.length < 5) errs.expiry = 'Enter valid expiry MM/YY';
    if (cardForm.cvv.length < 3) errs.cvv = 'Enter valid CVV';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Generate UPI payment link
  const getUpiPaymentLink = () => {
    const txnNote = `LearnSphere - ${course.title}`;
    const txnId = `LS${Date.now()}`;
    return `upi://pay?pa=${RECEIVER_UPI}&pn=${encodeURIComponent(RECEIVER_NAME)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(txnNote)}&tr=${txnId}`;
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(RECEIVER_UPI);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Handle UPI app payment
  const handleUpiAppPayment = (appName) => {
    const link = getUpiPaymentLink();
    window.location.href = link;
    setAwaitingPayment(true);
  };

  // Handle manual UPI payment
  const handleManualUpiPayment = () => {
    setAwaitingPayment(true);
  };

  // Handle UTR input - only allow digits, max 12
  const handleTransactionRefChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
    setTransactionRef(digits);
    setErrors({});
  };

  // Verify payment (user confirms they paid)
  const handleConfirmPayment = async () => {
    const utr = transactionRef.trim();
    setErrors({});

    if (!utr) {
      setErrors({ txnRef: 'Please enter the 12-digit UTR number' });
      return;
    }
    if (utr.length !== 12 || !/^\d{12}$/.test(utr)) {
      setErrors({ txnRef: 'UTR number must be exactly 12 digits' });
      return;
    }

    // Check if UTR already used
    const utrCheck = checkUTR(utr);
    if (utrCheck.used) {
      setErrors({ txnRef: `This UTR has already been submitted (Status: ${utrCheck.status}). Please enter a different UTR from your latest payment.` });
      return;
    }

    setProcessing(true);

    // Step 1: Connecting
    setVerificationStep(1);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 2: Submitting
    setVerificationStep(2);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Record payment as PENDING (not completed)
    const payment = {
      id: `PAY-${Date.now()}`,
      userId: user.id,
      courseId: parseInt(courseId),
      courseTitle: course.title,
      amount: totalAmount,
      originalPrice,
      discount,
      tax,
      method: 'upi',
      receiverUpi: RECEIVER_UPI,
      senderUpi: upiId || 'N/A',
      transactionRef: utr,
      coupon: couponApplied ? couponCode.toUpperCase() : null,
      status: 'pending',
      date: new Date().toISOString(),
      transactionId: `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      userName: user.name,
      userEmail: user.email,
    };
    if (addPayment) addPayment(payment);

    // Step 3: Submitted
    setVerificationStep(3);
    await new Promise((resolve) => setTimeout(resolve, 800));

    setProcessing(false);
    setVerificationStep(0);
    setPaymentSubmitted(true);
  };

  // Handle card payment
  const handleCardPayment = async () => {
    if (!validateCard()) return;

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const payment = {
      id: `PAY-${Date.now()}`,
      userId: user.id,
      courseId: parseInt(courseId),
      courseTitle: course.title,
      amount: totalAmount,
      originalPrice,
      discount,
      tax,
      method: 'card',
      cardLast4: cardForm.number.replace(/\s/g, '').slice(-4),
      coupon: couponApplied ? couponCode.toUpperCase() : null,
      status: 'pending',
      date: new Date().toISOString(),
      transactionId: `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      userName: user.name,
      userEmail: user.email,
    };

    if (addPayment) addPayment(payment);

    setProcessing(false);
    setPaymentSubmitted(true);
  };

  const handleFreeEnroll = () => {
    enrollCourse(user.id, parseInt(courseId));
    navigate(`/courses/${courseId}`);
  };

  // If course is free, just enroll
  if (isFree) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">This Course is Free!</h2>
          <p className="text-gray-500 mb-6">{course.title}</p>
          <button
            onClick={handleFreeEnroll}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Enroll Now {'\u2014'} It{'\u0027'}s Free
          </button>
          <Link
            to={`/courses/${courseId}`}
            className="block mt-4 text-gray-500 text-sm hover:text-gray-700"
          >
            {'\u2190'} Back to Course
          </Link>
        </div>
      </div>
    );
  }

  // If user already has a pending payment for this course
  if (pendingPayment && !paymentSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse opacity-50" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Clock className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Under Verification</h2>
          <p className="text-gray-500 mb-6">Your payment is being reviewed by our team. The course will be unlocked once verified.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">UTR Number</span>
              <span className="font-mono font-bold text-gray-900">{pendingPayment.transactionRef}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-gray-900">{'\u20B9'}{pendingPayment.amount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Submitted</span>
              <span className="text-gray-700">{new Date(pendingPayment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Pending Verification</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-6">Usually verified within 15-30 minutes during business hours.</p>
          <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  // If user has a rejected payment, show rejection reason and allow retry
  const rejectedPayment = userPayments.find(p => p.status === 'rejected');
  if (rejectedPayment && !awaitingPayment && !paymentSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Rejected</h2>
          <p className="text-gray-500 mb-4">Your previous payment could not be verified.</p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-red-700"><strong>Reason:</strong> {rejectedPayment.rejectReason || 'Payment not received'}</p>
            <p className="text-xs text-red-500 mt-2">UTR: {rejectedPayment.transactionRef}</p>
          </div>
          <button
            onClick={() => setAwaitingPayment(true)}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold text-lg rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <IndianRupee className="w-5 h-5" />
            Try Again with New Payment
          </button>
          <Link to={`/courses/${courseId}`} className="block mt-4 text-gray-500 text-sm hover:text-gray-700">
            {'\u2190'} Back to Course
          </Link>
        </div>
      </div>
    );
  }

  // Payment submitted screen (just submitted)
  if (paymentSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center animate-fade-in">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-40" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted for Verification</h2>
          <p className="text-gray-500 mb-6">Your payment details have been submitted. An admin will verify the transaction and unlock your course.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 text-left space-y-3">
            <div className="flex items-center gap-4 mb-3">
              <img src={course.image} alt={course.title} className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                <p className="text-sm text-gray-500">{course.lessons?.length || 0} lessons</p>
              </div>
            </div>
            <div className="border-t border-blue-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900">{'\u20B9'}{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">UTR Number</span>
                <span className="font-mono font-bold text-gray-900">{transactionRef}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Pending Verification</span>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6">
            <p className="text-sm text-green-700 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              You will get access once the admin verifies your payment
            </p>
          </div>
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  // Payment success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center animate-fade-in">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">You{'\u0027'}ve been enrolled in the course</p>

          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center gap-4 mb-4">
              <img src={course.image} alt={course.title} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                <p className="text-sm text-gray-500">{course.lessons?.length || 0} lessons</p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-bold text-gray-900">{'\u20B9'}{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <span className="text-gray-700 capitalize">{paymentMethod === 'card' ? 'Credit/Debit Card' : 'UPI'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Paid To</span>
                <span className="text-gray-700 font-mono text-xs">{RECEIVER_UPI}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/courses/${courseId}`}
              className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Start Learning
            </Link>
            <Link
              to="/courses"
              className="px-5 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Browse More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Awaiting UPI payment confirmation
  if (awaitingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        {processing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center">
            <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
              <div className="relative w-20 h-20 mx-auto mb-6">
                {verificationStep < 3 ? (
                  <>
                    <div className="absolute inset-0 border-4 border-primary-200 rounded-full" />
                    <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full animate-spin" />
                    <div className="absolute inset-3 bg-primary-50 rounded-full flex items-center justify-center">
                      <Shield className="w-7 h-7 text-primary-600" />
                    </div>
                  </>
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {verificationStep === 1 && 'Connecting to Payment Server...'}
                {verificationStep === 2 && 'Submitting Payment Details...'}
                {verificationStep === 3 && 'Payment Submitted!'}
              </h3>
              <p className="text-gray-500 text-sm">
                {verificationStep === 1 && 'Establishing secure connection...'}
                {verificationStep === 2 && `Recording UTR: ${transactionRef}`}
                {verificationStep === 3 && 'Awaiting admin verification...'}
              </p>
              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`h-1.5 rounded-full transition-all duration-500 ${
                    verificationStep >= step ? 'w-10 bg-primary-500' : 'w-6 bg-gray-200'
                  }`} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <IndianRupee className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Complete Your Payment</h2>
            <p className="text-white/80 mt-1">Pay {'\u20B9'}{totalAmount.toLocaleString('en-IN')} to enroll</p>
          </div>

          <div className="p-6 space-y-5">
            {/* UPI Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Pay via UPI
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100">
                  <div>
                    <p className="text-xs text-gray-500">UPI ID (Receiver)</p>
                    <p className="font-mono font-bold text-gray-900">{RECEIVER_UPI}</p>
                  </div>
                  <button
                    onClick={copyUpiId}
                    className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-blue-600" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100">
                  <div>
                    <p className="text-xs text-gray-500">Amount to Pay</p>
                    <p className="font-bold text-2xl text-gray-900">{'\u20B9'}{totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Receiver</p>
                    <p className="font-medium text-gray-700">{RECEIVER_NAME}</p>
                  </div>
                </div>
              </div>

              {/* Quick Pay Buttons */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                  <a
                    key={app}
                    href={getUpiPaymentLink()}
                    className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all text-center"
                  >
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <span className="text-[10px] font-medium text-gray-600">{app}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h4 className="font-semibold text-amber-800 mb-2 text-sm">Steps to complete:</h4>
              <ol className="space-y-1.5 text-sm text-amber-700">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <span>Open any UPI app (GPay, PhonePe, Paytm)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <span>Pay <strong>{'\u20B9'}{totalAmount.toLocaleString('en-IN')}</strong> to <strong className="font-mono">{RECEIVER_UPI}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <span>Enter the UTR/Transaction Reference below to verify</span>
                </li>
              </ol>
            </div>

            {/* Transaction Reference Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                UPI Transaction Reference (UTR Number)
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                id="utr-input"
                name="utr-input"
                value={transactionRef}
                onChange={handleTransactionRefChange}
                placeholder="Enter 12-digit UTR number"
                maxLength={12}
                className={`w-full px-4 py-3 rounded-xl border ${errors.txnRef ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono text-lg tracking-widest`}
              />
              {errors.txnRef && <p className="text-red-500 text-xs mt-1">{errors.txnRef}</p>}
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-gray-400">Find this in your UPI app{'\u0027'}s transaction history</p>
                <p className={`text-xs font-mono ${transactionRef.length === 12 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                  {transactionRef.length}/12 digits
                </p>
              </div>
            </div>

            {/* Confirm Payment */}
            <button
              onClick={handleConfirmPayment}
              disabled={processing}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-2xl hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <CheckCircle className="w-5 h-5" />
              Verify & Unlock Course
            </button>

            <button
              onClick={() => setAwaitingPayment(false)}
              className="w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              {'\u2190'} Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Processing overlay
  const ProcessingOverlay = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center">
      <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-primary-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full animate-spin" />
          <div className="absolute inset-3 bg-primary-50 rounded-full flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-primary-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
        <p className="text-gray-500 text-sm">Please wait while we process your payment securely...</p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Lock className="w-3.5 h-3.5" />
          <span>256-bit SSL Encryption</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {processing && <ProcessingOverlay />}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4 text-green-500" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: Payment Form (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Course Summary - Mobile */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:hidden">
              <div className="flex items-center gap-4">
                <img src={course.image} alt={course.title} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{course.lessons?.length || 0} lessons</p>
                  <div className="text-2xl font-bold text-gray-900 mt-2">{'\u20B9'}{originalPrice.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-600" />
                </div>
                Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'GPay, PhonePe, Paytm' },
                  { id: 'card', label: 'Card', icon: CreditCard, desc: 'Credit / Debit' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => { setPaymentMethod(method.id); setErrors({}); }}
                    className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                      paymentMethod === method.id
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {paymentMethod === method.id && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <method.icon className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === method.id ? 'text-primary-600' : 'text-gray-500'}`} />
                    <div className={`text-sm font-semibold ${paymentMethod === method.id ? 'text-primary-700' : 'text-gray-700'}`}>{method.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{method.desc}</div>
                  </button>
                ))}
              </div>

              {/* UPI Form */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  {/* Receiver info */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <BadgeCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-green-600 font-medium">Paying to verified account</p>
                        <p className="font-mono font-bold text-green-800">{RECEIVER_UPI}</p>
                      </div>
                      <button
                        onClick={copyUpiId}
                        className="px-3 py-1.5 bg-green-100 rounded-lg text-xs font-medium text-green-700 hover:bg-green-200 transition-colors flex items-center gap-1"
                      >
                        {copiedUpi ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
                  </div>

                  {/* UPI app buttons */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Pay using UPI App</p>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { name: 'Google Pay', short: 'GPay', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
                        { name: 'PhonePe', short: 'PhonePe', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
                        { name: 'Paytm', short: 'Paytm', color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100' },
                        { name: 'BHIM', short: 'BHIM', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
                      ].map((app) => (
                        <a
                          key={app.name}
                          href={getUpiPaymentLink()}
                          onClick={(e) => {
                            e.preventDefault();
                            handleUpiAppPayment(app.name);
                          }}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${app.color}`}
                        >
                          <Smartphone className="w-6 h-6 text-gray-600" />
                          <span className="text-xs font-semibold text-gray-700">{app.short}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">OR PAY MANUALLY</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Manual UPI */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-gray-600">
                      Send <strong className="text-gray-900">{'\u20B9'}{totalAmount.toLocaleString('en-IN')}</strong> to UPI ID: <strong className="font-mono text-primary-700">{RECEIVER_UPI}</strong>
                    </p>
                    <button
                      onClick={handleManualUpiPayment}
                      className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      I{'\u0027'}ll Pay & Verify
                    </button>
                  </div>
                </div>
              )}

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardForm.name}
                      onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                      placeholder="Full Name"
                      className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardForm.number}
                        onChange={(e) => setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-4 py-3 pr-12 rounded-xl border ${errors.number ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all`}
                      />
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry</label>
                      <input
                        type="text"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.expiry ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all`}
                      />
                      {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={cardForm.cvv}
                          onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                          placeholder="..."
                          maxLength={4}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.cvv ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all`}
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                    </div>
                  </div>

                  <button
                    onClick={handleCardPayment}
                    disabled={processing}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold text-lg rounded-2xl hover:shadow-xl hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
                  >
                    <Lock className="w-5 h-5" />
                    Pay {'\u20B9'}{totalAmount.toLocaleString('en-IN')}
                  </button>
                </div>
              )}
            </div>

            {/* Security Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 py-4">
              {[
                { icon: Shield, label: 'SSL Secured' },
                { icon: Lock, label: '256-bit Encrypted' },
                { icon: BadgeCheck, label: 'Verified Merchant' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-400">
                  <badge.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Order Summary (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <img src={course.image} alt={course.title} className="w-full h-44 object-cover" />
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.lessons?.length || 0} lessons</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.ceil((course.lessons?.reduce((s, l) => s + (l.duration || 0), 0) || 0) / 60)}h</span>
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Certificate</span>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary-600" />
                Have a Coupon?
              </h4>
              {couponApplied ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{couponCode.toUpperCase()}</span>
                    <span className="text-xs text-green-600">(-{'\u20B9'}{discount.toLocaleString('en-IN')})</span>
                  </div>
                  <button onClick={removeCoupon} className="p-1 hover:bg-green-100 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(VALID_COUPONS).map(([code, info]) => (
                  <button
                    key={code}
                    onClick={() => setCouponCode(code)}
                    className="px-2 py-1 bg-gray-50 border border-dashed border-gray-300 rounded-md text-xs text-gray-500 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Order Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Course Price</span>
                  <span className="text-gray-900">{'\u20B9'}{originalPrice.toLocaleString('en-IN')}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> Coupon Discount</span>
                    <span className="text-green-600 font-medium">-{'\u20B9'}{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (18% GST)</span>
                  <span className="text-gray-900">{'\u20B9'}{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    {couponApplied && (
                      <div className="text-xs text-gray-400 line-through">{'\u20B9'}{(originalPrice + Math.round(originalPrice * 0.18)).toLocaleString('en-IN')}</div>
                    )}
                    <span className="text-xl font-bold text-gray-900">{'\u20B9'}{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantee */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-5 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">30-Day Money-Back Guarantee</h4>
              <p className="text-xs text-gray-500">
                Not satisfied? Get a full refund within 30 days. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
