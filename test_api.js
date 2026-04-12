const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './Backend/.env' });

async function test() {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  const User = require('./Backend/Models/User');
  const user = await User.findOne();
  if (!user) { console.log('No user'); process.exit(1); }
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  const res = await fetch('http://localhost:5001/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ title: "Test Task", description: "Hello", priority: "High" })
  });
  
  // Actually, wait, the API expects cookies for credentials: 'include'.
  // auth middleware checks req.cookies.jwt!!
  // So I need to pass the cookie!
  
  const cookieRes = await fetch('http://localhost:5001/api/tasks', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Cookie': `jwt=${token}`
    },
    body: JSON.stringify({ title: "Test Task", description: "Hello", priority: "High" })
  });

  console.log("Status:", cookieRes.status);
  const text = await cookieRes.text();
  console.log("Response:", text);
  process.exit(0);
}
test().catch(console.error);
