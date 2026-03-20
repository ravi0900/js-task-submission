import React, { useState, useCallback, useEffect } from 'react';

const API_BASE_URL = ''; // Use relative URL for same origin
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const App = () => {
  // Theme management
  const [theme, setTheme] = useState(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  console.log(`\n[${new Date().toISOString()} CLIENT: React App initialized`);
  console.log(`   Max retries: ${MAX_RETRIES}`);
  console.log(`   Retry delay: ${RETRY_DELAY}ms`);
  console.log(`   API URL: ${API_BASE_URL}`);
  console.log(`   Theme: ${theme}`);
  
  const [formData, setFormData] = useState({
    email: '',
    amount: ''
  });
  const [status, setStatus] = useState('idle'); // idle, pending, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [submittedRecords, setSubmittedRecords] = useState(new Set());

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      return 'Please enter a valid positive amount';
    }
    return null;
  };

  const createRecordId = (email, amount) => `${email}-${amount}`;

  const submitForm = useCallback(async (retries = 0) => {
    const recordId = createRecordId(formData.email, formData.amount);
    const timestamp = new Date().toISOString();
    
    console.log(`\n[${timestamp}] CLIENT: Starting submission`);
    console.log(`   Email: ${formData.email}`);
    console.log(`   Amount: ${formData.amount}`);
    console.log(`   Record ID: ${recordId}`);
    console.log(`   Retry attempt: ${retries}`);
    console.log(`   Local records count: ${submittedRecords.size}`);
    
    // Check for duplicates by email only
    const existingEmail = Array.from(submittedRecords).find(record => record.startsWith(formData.email + '-'));
    if (existingEmail) {
      console.log(`   CLIENT: Duplicate email detected locally: ${formData.email}`);
      console.log(`   CLIENT: Existing record: ${existingEmail}`);
      setStatus('error');
      setErrorMessage('Email already submitted');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log(`   CLIENT: Sending API request...`);
      const response = await fetch(`${API_BASE_URL}/api/submit.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          amount: parseFloat(formData.amount)
        })
      });

      const data = await response.json();
      console.log(`   CLIENT: Response received`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Data:`, data);

      if (response.status === 200) {
        // Success
        console.log(`   CLIENT: Submission successful`);
        console.log(`   CLIENT: Adding to local records: ${recordId}`);
        setStatus('success');
        setErrorMessage('');
        setSubmittedRecords(prev => new Set([...prev, recordId]));
        setFormData({ email: '', amount: '' });
        setIsSubmitting(false);
        setRetryCount(0);
      } else if (response.status === 503 && retries < MAX_RETRIES) {
        // Temporary failure - retry
        console.log(`   CLIENT: Server busy, scheduling retry ${retries + 1}/${MAX_RETRIES}`);
        console.log(`   CLIENT: Retry delay: ${RETRY_DELAY * (retries + 1)}ms`);
        setRetryCount(retries + 1);
        setStatus('pending');
        setErrorMessage(`Server busy... Retrying (${retries + 1}/${MAX_RETRIES})`);
        
        setTimeout(() => {
          submitForm(retries + 1);
        }, RETRY_DELAY * (retries + 1)); // Exponential backoff
      } else if (response.status === 409) {
        // Duplicate detected by server
        console.log(`   CLIENT: Server detected duplicate email`);
        console.log(`   CLIENT: Adding to local records to prevent further attempts: ${recordId}`);
        setStatus('error');
        setErrorMessage('Email already submitted');
        setSubmittedRecords(prev => new Set([...prev, recordId]));
        setIsSubmitting(false);
        setRetryCount(0);
      } else {
        // Other errors or max retries exceeded
        console.log(`   CLIENT: Request failed - ${data.error || 'Unknown error'}`);
        setStatus('error');
        setErrorMessage(data.error || 'Submission failed. Please try again.');
        setIsSubmitting(false);
        setRetryCount(0);
      }
    } catch (error) {
      console.log(`   CLIENT: Network error occurred:`, error.message);
      if (retries < MAX_RETRIES) {
        // Network error - retry
        console.log(`   CLIENT: Scheduling network retry ${retries + 1}/${MAX_RETRIES}`);
        console.log(`   CLIENT: Retry delay: ${RETRY_DELAY * (retries + 1)}ms`);
        setRetryCount(retries + 1);
        setErrorMessage('Processing...');
        
        setTimeout(() => {
          submitForm(retries + 1);
        }, RETRY_DELAY * (retries + 1));
      } else {
        console.log(`   CLIENT: Max retries exceeded for network error`);
        setStatus('error');
        setErrorMessage('Network error. Please check your connection and try again.');
        setIsSubmitting(false);
        setRetryCount(0);
      }
    }
  }, [formData, submittedRecords]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    
    console.log(`\n[${timestamp}] CLIENT: Form submission initiated`);
    console.log(`   Email: ${formData.email}`);
    console.log(`   Amount: ${formData.amount}`);
    
    const validationError = validateForm();
    if (validationError) {
      console.log(`   CLIENT: Validation failed - ${validationError}`);
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    console.log(`   CLIENT: Validation passed`);
    console.log(`   CLIENT: Setting UI to processing state`);
    setIsSubmitting(true);
    setStatus('pending');
    setErrorMessage('Processing...');
    setRetryCount(0);

    submitForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`   CLIENT: Input changed - ${name}: ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (status === 'error') {
      console.log(`   CLIENT: Clearing error state`);
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="status-message status-pending">
            <div className="loading-spinner"></div>
            {errorMessage || 'Processing your submission...'}
          </div>
        );
      case 'success':
        return (
          <div className="status-message status-success">
            Submission successful!
          </div>
        );
      case 'error':
        return (
          <div className="status-message status-error">
            Error: {errorMessage}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      
      <h1 className="title">Submit Information</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your email"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter amount"
            step="0.01"
            min="0.01"
            disabled={isSubmitting}
            required
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="loading-spinner"></div>
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </button>
      </form>

      {getStatusMessage()}
    </div>
  );
};

export default App;
