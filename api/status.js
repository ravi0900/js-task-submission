// Store submitted records to prevent duplicates
const submittedRecords = new Set();

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] STATUS CHECK REQUESTED`);
  console.log(`   Current records: ${submittedRecords.size}`);
  console.log(`   Responding with server status\n`);
  res.json({ status: 'Server running', recordsCount: submittedRecords.size });
}
