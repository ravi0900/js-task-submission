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
  const count = submittedRecords.size;
  submittedRecords.clear();
  console.log(`\n[${timestamp}] RECORDS RESET`);
  console.log(`   Cleared ${count} records`);
  console.log(`   Responding with reset confirmation\n`);
  res.json({ message: 'Records reset' });
}
