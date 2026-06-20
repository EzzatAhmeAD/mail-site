// /api/receive-email.js
export default async function handler(req, res) {
    // إعدادات السماح بالاتصال
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        // ضع هنا كود جلب الإيميلات من قاعدة البيانات (مثل Vercel KV أو Redis)
        // إذا كنت تستخدم Vercel KV، سيكون الكود هنا:
        // const { kv } = require('@vercel/kv');
        // const emails = await kv.lrange('emails', 0, -1);
        
        // حالياً سنقوم بإرجاع مصفوفة تجريبية للتأكد من عمل الموقع
        const emails = [
            { id: 1, sender: "test@example.com", subject: "Test Email", body: "Hello, the system is working!" }
        ];
        
        res.status(200).json(emails);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch emails" });
    }
}
