global.emailStorage = global.emailStorage || [];

const validAccounts = [
  { username: "user55@ezzatrabie.com", password: "password123" },
  { username: "fortnite1@ezzatrabie.com", password: "fortnitepass" }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { id_user, source, subject, html, text, date } = req.body;
    if (!id_user) return res.status(400).json({ error: "Missing identity" });
    
    const cleanUser = id_user.trim().toLowerCase();
    
    // حفظنا هنا الـ html والـ text معاً لضمان قراءة التصميم الكامل
    global.emailStorage.push({ cleanUser, source, subject, html, text, date });
    
    if (global.emailStorage.length > 500) global.emailStorage.shift();
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    const { username, password } = req.query;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const cleanUser = username.trim().toLowerCase();
    const accountCheck = validAccounts.find(acc => acc.username.toLowerCase() === cleanUser && acc.password === password);
    
    if (!accountCheck) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const userEmails = global.emailStorage.filter(email => email.cleanUser === cleanUser);
    return res.status(200).json({ emails: userEmails });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
