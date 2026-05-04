const fs = require('fs');
fetch('http://localhost:3000/api/send-ticket-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'onboarding@resend.dev',
    full_name: 'Test',
    ticket_id: 'TK-001',
    urgency: 'Alta',
    subject: 'Test Subject'
  })
}).then(r => r.text().then(t => fs.writeFileSync('error.html', t))).catch(e => console.error(e));
