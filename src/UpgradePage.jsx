import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpgradePage.css';
import {
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineSparkles,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineX
} from 'react-icons/hi';
import { FaCreditCard, FaPaypal, FaLock } from 'react-icons/fa';

export default function UpgradePage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [paymentMethod, setPaymentMethod] = useState('card'); // card or paypal
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Get user email from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, []);

  const plans = {
    pro: {
      name: 'Pro Optimization',
      price: 9,
      period: 'one-time',
      description: 'Perfect for job seekers who want a professional edge',
      features: [
        'Full AI resume rewrite',
        'ATS optimization & formatting',
        'Download as PDF or DOCX',
        '5 professional templates',
        'Unlimited revisions for 30 days',
        'Cover letter generator',
        'LinkedIn profile optimization',
        'Email support'
      ],
      badge: 'Most Popular'
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number (add spaces every 4 digits)
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Max 16 digits + 3 spaces
    }

    // Format expiry date (MM/YY)
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) return;
    }

    // Format CVV (max 4 digits)
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === 'card') {
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }

      if (!formData.cardName || formData.cardName.trim().length < 3) {
        newErrors.cardName = 'Please enter the name on card';
      }

      if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Please enter expiry date (MM/YY)';
      }

      if (!formData.cvv || formData.cvv.length < 3) {
        newErrors.cvv = 'Please enter CVV';
      }
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, you'd call your payment API here
      // const response = await fetch('http://localhost:5050/api/payment/process', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     plan: selectedPlan,
      //     amount: plans[selectedPlan].price,
      //     paymentMethod,
      //     ...formData
      //   })
      // });

      // Update user plan in localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...user,
        plan: {
          type: selectedPlan,
          status: 'active',
          startDate: new Date().toISOString(),
          paymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
          features: selectedPlan === 'pro' ? {
            maxUploads: 999999,
            maxGenerations: 999999,
            hasTemplates: true,
            hasAdvancedAI: true,
            hasPrioritySupport: true
          } : {}
        }
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update userPlan for BillingPage
      const planData = {
        plan: selectedPlan,
        billingInfo: {
          purchasedDate: new Date().toISOString(),
          paymentMethod: paymentMethod === 'card' ? `Credit Card •••• ${formData.cardNumber.slice(-4)}` : 'PayPal',
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
          paymentHistory: [{
            date: new Date().toISOString(),
            amount: plans[selectedPlan].price.toFixed(2),
            description: `${plans[selectedPlan].name} - ${plans[selectedPlan].period}`
          }]
        }
      };
      localStorage.setItem('userPlan', JSON.stringify(planData));

      setIsProcessing(false);
      setShowSuccessModal(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="upgrade-page">
      {/* Header */}
      <div className="upgrade-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <HiOutlineArrowLeft />
          <span>Back</span>
        </button>
        <div className="header-content">
          <h1>Upgrade to Pro</h1>
          <p>Unlock powerful AI features and stand out from the competition</p>
        </div>
      </div>

      <div className="upgrade-container">
        {/* Left Side - Plan Selection */}
        <div className="plans-section">
          <h2>Choose Your Plan</h2>
          
          <div className="plans-cards">
            {/* Pro Plan */}
            <div 
              className={`plan-card ${selectedPlan === 'pro' ? 'selected' : ''}`}
              onClick={() => setSelectedPlan('pro')}
            >
              {plans.pro.badge && (
                <div className="plan-badge" style={{ background: 'var(--primary)' }}>
                  {plans.pro.badge}
                </div>
              )}
              
              <div className="plan-header-section">
                <h3>{plans.pro.name}</h3>
                <div className="plan-price">
                  <span className="price">${plans.pro.price}</span>
                  <span className="period">{plans.pro.period}</span>
                </div>
                <p className="plan-description">{plans.pro.description}</p>
              </div>

              <ul className="plan-features-list">
                {plans.pro.features.map((feature, idx) => (
                  <li key={idx}>
                    <HiOutlineCheckCircle className="check-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {selectedPlan === 'pro' && (
                <div className="selected-indicator">
                  <HiOutlineCheckCircle /> Selected
                </div>
              )}
            </div>

            {/* Team plan removed for now */}
          </div>

          {/* Trust Badges */}
          <div className="trust-badges">
            <div className="trust-badge">
              <HiOutlineShieldCheck />
              <span>Secure Payment</span>
            </div>
            <div className="trust-badge">
              <HiOutlineLightningBolt />
              <span>Instant Access</span>
            </div>
            <div className="trust-badge">
              <HiOutlineStar />
              <span>30-Day Guarantee</span>
            </div>
          </div>
        </div>

        {/* Right Side - Payment Form */}
        <div className="payment-section">
          <div className="payment-card">
            <h2>Payment Details</h2>
            
            {/* Order Summary */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>{plans[selectedPlan].name}</span>
                <span className="amount">${plans[selectedPlan].price}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span className="amount">${plans[selectedPlan].price}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="payment-methods">
              <button
                className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <FaCreditCard />
                <span>Credit Card</span>
              </button>
              <button
                className={`payment-method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <FaPaypal />
                <span>PayPal</span>
              </button>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="payment-form">
              {paymentMethod === 'card' ? (
                <>
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className={errors.cardNumber ? 'error' : ''}
                    />
                    {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                  </div>

                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className={errors.cardName ? 'error' : ''}
                    />
                    {errors.cardName && <span className="error-text">{errors.cardName}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className={errors.expiryDate ? 'error' : ''}
                      />
                      {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
                    </div>

                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className={errors.cvv ? 'error' : ''}
                      />
                      {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="paypal-info">
                  <FaPaypal className="paypal-icon" />
                  <p>You'll be redirected to PayPal to complete your purchase securely.</p>
                </div>
              )}

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-small"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaLock />
                    Pay ${plans[selectedPlan].price} Securely
                  </>
                )}
              </button>

              <p className="secure-note">
                <HiOutlineShieldCheck />
                Your payment information is encrypted and secure
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <button className="close-modal" onClick={() => setShowSuccessModal(false)}>
              <HiOutlineX />
            </button>
            
            <div className="success-icon-circle">
              <HiOutlineCheckCircle className="success-icon" />
            </div>
            
            <h2>Payment Successful! 🎉</h2>
            <p>Welcome to {plans[selectedPlan].name}!</p>
            
            <div className="success-details">
              <p>You now have access to all premium features:</p>
              <ul>
                {plans[selectedPlan].features.slice(0, 4).map((feature, idx) => (
                  <li key={idx}>
                    <HiOutlineCheckCircle /> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={() => navigate('/dashboard')} className="success-button">
              <HiOutlineSparkles />
              Go to Dashboard
            </button>
            
            <p className="redirect-note">Redirecting in 3 seconds...</p>
          </div>
        </div>
      )}
    </div>
  );
}
