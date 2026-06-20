// المخزن المؤقت للرسائل الواردة فقط
global.emailStorage = global.emailStorage || [];

// قائمة الحسابات الثابتة (عدل هنا براحتك في أي وقت)
const validAccounts = [
  { username: "user55@ezzatrabie.com", password: "password123" },
  { username: "fortnite1@ezzatrabie.com", password: "fortnitepass" }
];

export default async function handler(req, res) {
  // تفعيل الـ CORS عشان المتصفح يقبل الطلبات بدون مشاكل
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. استقبال الرسائل من كلوود فلير
  if (req.method === 'POST') {
    const { id_user, source, subject, text, date } = req.body;
    if (!id_user) return res.status(400).json({ error: "Missing identity" });
    
    const cleanUser = id_user.trim().toLowerCase();
    global.emailStorage.push({ cleanUser, source, subject, text, date });
    
    if (global.emailStorage.length > 500) global.emailStorage.shift();
    return res.status(200).json({ success: true });
  }

  // 2. التحقق من تسجيل دخول المشتري
  if (req.method === 'GET') {
    const { username, password } = req.query;
    if (!username || !password) {
      return res.status(400).json({ error: "Please enter both username and password." });
    }

    const cleanUser = username.trim().toLowerCase();

    // البحث عن الحساب في القائمة الثابتة
    const accountCheck = validAccounts.find(acc => acc.username.toLowerCase() === cleanUser && acc.password === password);
    
    if (!accountCheck) {
      return res.status(401).json({ error: "Invalid username or password, or account not registered." });
    }

    // جلب الرسائل الخاصة بهذا الحساب
    const userEmails = global.emailStorage.filter(email => email.cleanUser === cleanUser);
    return res.status(200).json({ emails: userEmails });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
