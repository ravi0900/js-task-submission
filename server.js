const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Store submitted records to prevent duplicates
const submittedRecords = new Set();

app.post('/api/submit', (req, res) => {
  const timestamp = new Date().toISOString();
  const { email, amount } = req.body;
  
  console.log(`\n[${timestamp}] NEW SUBMISSION RECEIVED`);
  console.log(`   Email: ${email}`);
  console.log(`   Amount: ${amount}`);
  console.log(`   Current records count: ${submittedRecords.size}`);
  
  // Check for duplicate by email only
  const existingEmail = Array.from(submittedRecords).find(record => record.startsWith(email + '-'));
  if (existingEmail) {
    console.log(`   DUPLICATE EMAIL DETECTED: ${email}`);
    console.log(`   Existing record: ${existingEmail}`);
    console.log(`   Responding with 409 Conflict\n`);
    return res.status(409).json({ error: 'Email already submitted' });
  }
  
  // Create a unique record identifier
  const recordId = `${email}-${amount}`;
  
  // Random response scenarios
  const random = Math.random();
  console.log(`   Random value: ${random.toFixed(4)}`);
  
  if (random < 0.4) {
    // 40% success
    console.log(`   SUCCESS SCENARIO (40% chance)`);
    submittedRecords.add(recordId);
    console.log(`   Added to records: ${recordId}`);
    console.log(`   Responding with 200 Success\n`);
    res.status(200).json({ success: true, message: 'Submission successful' });
  } else if (random < 0.7) {
    // 30% temporary failure
    console.log(`   TEMPORARY FAILURE SCENARIO (30% chance)`);
    console.log(`   Responding with 503 Service Unavailable\n`);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  } else {
    // 30% delayed success (5-10 seconds)
    const delay = 5000 + Math.random() * 5000;
    console.log(`   DELAYED SUCCESS SCENARIO (30% chance)`);
    console.log(`   Delay: ${(delay/1000).toFixed(1)} seconds`);
    console.log(`   Scheduling delayed response...`);
    
    setTimeout(() => {
      const completionTime = new Date().toISOString();
      console.log(`\n[${completionTime}] DELAYED RESPONSE COMPLETED`);
      console.log(`   Record: ${recordId}`);
      console.log(`   Added to records: ${recordId}`);
      console.log(`   Responding with 200 Success (delayed)\n`);
      submittedRecords.add(recordId);
      res.status(200).json({ success: true, message: 'Submission successful (delayed)' });
    }, delay);
  }
});

// Endpoint to check server status
app.get('/api/status', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] STATUS CHECK REQUESTED`);
  console.log(`   Current records: ${submittedRecords.size}`);
  console.log(`   Responding with server status\n`);
  res.json({ status: 'Server running', recordsCount: submittedRecords.size });
});

// Reset records (for testing)
app.post('/api/reset', (req, res) => {
  const timestamp = new Date().toISOString();
  const count = submittedRecords.size;
  submittedRecords.clear();
  console.log(`\n[${timestamp}] RECORDS RESET`);
  console.log(`   Cleared ${count} records`);
  console.log(`   Responding with reset confirmation\n`);
  res.json({ message: 'Records reset' });
});

app.listen(port, () => {
  console.log(`\nMOCK API SERVER STARTED`);
  console.log(`   URL: http://localhost:${port}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   Ready to handle requests...\n`);
});
