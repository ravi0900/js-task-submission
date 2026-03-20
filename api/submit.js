// Store submitted records to prevent duplicates
let submittedRecords = new Set();

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const timestamp = new Date().toISOString();
  const { email, amount } = req.body;
  
  console.log(`\n[${timestamp}] NEW SUBMISSION RECEIVED`);
  console.log(`   Email: ${email}`);
  console.log(`   Amount: ${amount}`);
  console.log(`   Current total submissions: ${submittedRecords.size}`);
  
  // Server-side validation
  const validationErrors = [];
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string') {
    validationErrors.push('Email is required and must be a string');
  } else if (!emailRegex.test(email.trim())) {
    validationErrors.push('Invalid email format');
  }
  
  // Amount validation - accept float or int numbers only
  const numAmount = parseFloat(amount);
  if (amount === undefined || amount === null || amount === '') {
    validationErrors.push('Amount is required');
  } else if (isNaN(numAmount) || typeof amount !== 'number' && typeof amount !== 'string') {
    validationErrors.push('Amount must be a number');
  } else if (numAmount <= 0) {
    validationErrors.push('Amount must be greater than 0');
  }
  
  // Return validation errors if any
  if (validationErrors.length > 0) {
    console.log(`   VALIDATION FAILED: ${validationErrors.join(', ')}`);
    console.log(`   Response: 400 Bad Request\n`);
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: validationErrors 
    });
  }
  
  // Clean and normalize data
  const cleanEmail = email.trim().toLowerCase();
  const cleanAmount = numAmount;
  
  // Check for duplicate by email only
  const existingEmail = Array.from(submittedRecords).find(record => record.startsWith(cleanEmail + '-'));
  if (existingEmail) {
    console.log(`   DUPLICATE EMAIL BLOCKED: ${cleanEmail} was already submitted`);
    console.log(`   Previous submission: ${existingEmail}`);
    console.log(`   Response: 409 Conflict (Email already exists)\n`);
    return res.status(409).json({ error: 'Email already submitted' });
  }
  
  // Create a unique record identifier
  const recordId = `${cleanEmail}-${cleanAmount}`;
  
  // Random response scenarios
  const random = Math.random();
  console.log(`   Random value: ${random.toFixed(4)} (determines response type)`);
  
  if (random < 0.4) {
    // 40% success
    console.log(`   Response: 200 Success (Immediate approval)`);
    submittedRecords.add(recordId);
    console.log(`   Record stored: ${cleanEmail} with amount ${cleanAmount}`);
    console.log(`   Total submissions now: ${submittedRecords.size}\n`);
    res.status(200).json({ success: true, message: 'Submission successful' });
  } else if (random < 0.7) {
    // 30% temporary failure
    console.log(`   Response: 503 Service Unavailable (Triggers retry logic)`);
    console.log(`   Client should retry automatically\n`);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  } else {
    // 30% delayed success (5-10 seconds)
    const delay = 5000 + Math.random() * 5000;
    console.log(`   Response: 200 Success (Delayed ${(delay/1000).toFixed(1)} seconds)`);
    console.log(`   Processing... will complete after delay\n`);
    
    setTimeout(() => {
      const completionTime = new Date().toISOString();
      console.log(`\n[${completionTime}] DELAYED RESPONSE COMPLETED`);
      console.log(`   Record: ${cleanEmail} with amount ${cleanAmount}`);
      console.log(`   Response: 200 Success (After delay)`);
      submittedRecords.add(recordId);
      console.log(`   Total submissions now: ${submittedRecords.size}\n`);
      res.status(200).json({ success: true, message: 'Submission successful (delayed)' });
    }, delay);
  }
}
