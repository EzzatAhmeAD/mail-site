global.emailStorage = global.emailStorage || [];

// Add your sold accounts here (Username and Password)
global.validAccounts = global.validAccounts || [
  { username: "user55@ezzatrabie.com", password: "password123" },
  { username: "fortnite1@ezzatrabie.com", password: "fortnitepass" }
];

export default async function handler(req, res) {
  // Receive email from Cloudflare Worker
  if (req.method === 'POST') {
    const { id_user, source, subject, text, date } = req.body;
    const cleanUser = id_user.trim().toLowerCase();

    global.emailStorage.push({ cleanUser, source, subject, text, date });
    
    if (global.emailStorage.length > 500) global.emailStorage.shift();
    return res.status(200).json({ success: true });
  }

  // Get emails for the buyer
  if (req.method === 'GET') {
    const { username, password } = req.query;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const cleanUser = username.trim().toLowerCase();

    const accountCheck = global.validAccounts.find(acc => acc.username.toLowerCase() === cleanUser && acc.password === password);
    if (!accountCheck) {
      return res.status(401).json({ error: "Invalid username or password, or account not registered." });
    }

    const userEmails = global.emailStorage.filter(email => email.cleanUser === cleanUser);
    return res.status(200).json({ emails: userEmails });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
