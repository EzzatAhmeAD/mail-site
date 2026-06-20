global.emailStorage = global.emailStorage || [];

const validAccounts = [
  { username: "user55@ezzatrabie.com", password: "password123" },
  { username: "fortnite1@ezzatrabie.com", password: "fortnitepass" }
];

// دالة فك تشفير تنسيق رايوت وإيبيك الأصلي
function decodeQuotedPrintable(str) {
  if (!str) return "";
  return str
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-F]{2})/gi, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. استقبال الرسائل من الـ Worker
  if (req.method === 'POST') {
    const { id_user, source, subject, rawBody } = req.body;
    if (!id_user) return res.status(400).json({ error: "Missing identity" });
    
    const cleanUser = id_user.trim().toLowerCase();
    let htmlBody = "";

    if (rawBody && (rawBody.includes("<!DOCTYPE") || rawBody.includes("<html") || rawBody.includes("<body"))) {
      const startIdx = rawBody.search(/<(html|!DOCTYPE)/i);
      if (startIdx !== -1) {
        htmlBody = rawBody.substring(startIdx);
        const endIdx = htmlBody.toLowerCase().lastIndexOf("</html>");
        if (endIdx !== -1) {
          htmlBody = htmlBody.substring(0, endIdx + 7);
        }
      }
    }

    if (htmlBody) {
      htmlBody = decodeQuotedPrintable(htmlBody);
    } else {
      let textBody = rawBody.includes("\r\n\r\n") ? rawBody.split("\r\n\r\n").slice(1).join("\n\n") : rawBody;
      textBody = decodeQuotedPrintable(textBody);
      htmlBody = `<div style="font-family: sans-serif; padding: 20px; color: #333;">${textBody}</div>`;
    }

    global.emailStorage.push({ cleanUser, source, subject, html: htmlBody, date: new Date().toISOString() });
    
    if (global.emailStorage.length > 500) global.emailStorage.shift();
    return res.status(200).json({ success: true });
  }

  // 2. التحقق من تسجيل الدخول وجلب الإيميلات
  if (req.method === 'GET') {
    const { username, password } = req.query;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const cleanUser = username.trim().toLowerCase();
    const accountCheck = validAccounts.find(acc => acc.username.toLowerCase() === cleanUser && acc.password === password);
    
    if (!accountCheck) return res.status(401).json({ error: "Invalid credentials." });

    const userEmails = global.emailStorage.filter(email => email.cleanUser === cleanUser);
    return res.status(200).json({ emails: userEmails });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
