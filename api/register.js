import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Verify Cloudflare Turnstile token
async function verifyTurnstile(token, ip) {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });
  return res.json();
}

function sanitize(str) {
  if (!str) return '';
  return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const {
    name,
    email,
    age,
    level,
    message,
    'cf-turnstile-response': turnstileToken,
  } = req.body;

  // Basic validation
  if (!name || !email || !age || !turnstileToken) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email invalide.' });
  }
  const ageNum = parseInt(age, 10);
  if (isNaN(ageNum) || ageNum < 8 || ageNum > 40) {
    return res.status(400).json({ error: 'Âge invalide.' });
  }

  // Verify CAPTCHA
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress;
  const captchaResult = await verifyTurnstile(turnstileToken, ip);
  if (!captchaResult.success) {
    return res.status(400).json({ error: 'Vérification anti-bot échouée. Réessaie.' });
  }

  // Sanitize inputs
  const safeName    = sanitize(name);
  const safeEmail   = sanitize(email);
  const safeLevel   = sanitize(level);
  const safeMessage = sanitize(message);

  try {
    // 1. Notify admin
    await resend.emails.send({
      from: `BasketBall Player Camp <noreply@${process.env.EMAIL_DOMAIN}>`,
      to: [process.env.ADMIN_EMAIL],
      replyTo: safeEmail,
      subject: `🏀 Nouvelle inscription — ${safeName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#FF6B00;margin-bottom:24px">Nouvelle demande d'inscription</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px 0;color:#666;width:120px">Nom</td>
              <td style="padding:10px 0;font-weight:600">${safeName}</td>
            </tr>
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px 0;color:#666">Email</td>
              <td style="padding:10px 0"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
            </tr>
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px 0;color:#666">Âge</td>
              <td style="padding:10px 0">${ageNum} ans</td>
            </tr>
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px 0;color:#666">Niveau</td>
              <td style="padding:10px 0">${safeLevel || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#666;vertical-align:top">Message</td>
              <td style="padding:10px 0">${safeMessage || '—'}</td>
            </tr>
          </table>
          <p style="margin-top:24px;color:#999;font-size:12px">
            Envoyé via le formulaire BasketBall Player Camp
          </p>
        </div>
      `,
    });

    // 2. Confirm to participant
    await resend.emails.send({
      from: `BasketBall Player Camp <noreply@${process.env.EMAIL_DOMAIN}>`,
      to: [safeEmail],
      subject: '✅ Ta demande a bien été reçue — BasketBall Player Camp',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0A0A0A;color:#fff">
          <h1 style="color:#FF6B00;font-size:2rem;margin-bottom:8px">BASKETBALL PLAYER CAMP 🏀</h1>
          <h2 style="font-weight:400;margin-bottom:24px;color:#ccc">Demande reçue !</h2>
          <p style="font-size:1.1rem">Salut <strong>${safeName}</strong> !</p>
          <p style="color:#aaa;line-height:1.7;margin-top:12px">
            On a bien reçu ta demande d'inscription au <strong style="color:#fff">BasketBall Player Camp</strong>.
            Notre équipe revient vers toi dans les <strong style="color:#FF6B00">48h</strong> avec toutes les informations.
          </p>
          <div style="margin:32px 0;padding:20px;background:#1A1A1A;border-left:4px solid #FF6B00;border-radius:4px">
            <p style="margin:0;color:#ccc;font-size:0.95rem">
              Des questions en attendant ? Réponds directement à cet email ou contacte-nous sur Instagram.
            </p>
          </div>
          <p style="color:#666;font-size:0.9rem;margin-top:32px">
            À très vite sur le terrain ! 🏀<br/>
            <strong style="color:#FF6B00">L'équipe BasketBall Player Camp</strong>
          </p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi. Réessaie plus tard.' });
  }
}
