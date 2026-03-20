export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/submit') {
    const { email, amount } = req.body;
    res.json({ 
      success: true, 
      message: 'Submit endpoint working!', 
      data: { email, amount },
      timestamp: new Date().toISOString() 
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/api/status') {
    res.json({ 
      status: 'Server running', 
      message: 'Status endpoint working!',
      timestamp: new Date().toISOString() 
    });
    return;
  }

  res.json({ 
    message: 'API is working!', 
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString() 
  });
}
