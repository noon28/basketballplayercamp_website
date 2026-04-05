<?php
/**
 * BasketBall Player Camp — Formulaire d'inscription
 * Compatible OVH hébergement mutualisé (PHP 8+)
 */

// ── Config ──────────────────────────────────────────────────────────────────
require_once __DIR__ . '/config.php';

// ── CORS ────────────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: ' . BPC_ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error(405, 'Méthode non autorisée.');
}

// ── Lecture du body JSON ─────────────────────────────────────────────────────
$body = json_decode(file_get_contents('php://input'), true);
if (!$body) {
    json_error(400, 'Requête invalide.');
}

$name           = $body['name']                    ?? '';
$email          = $body['email']                   ?? '';
$age            = $body['age']                     ?? '';
$formula        = $body['formula']                 ?? '';
$level          = $body['level']                   ?? '';
$message        = $body['message']                 ?? '';
$turnstileToken = $body['cf-turnstile-response']   ?? '';

// ── Validation ───────────────────────────────────────────────────────────────
if (!$name || !$email || !$age || !$turnstileToken) {
    json_error(400, 'Champs obligatoires manquants.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error(400, 'Email invalide.');
}

$ageNum = (int) $age;
if ($ageNum < 8 || $ageNum > 40) {
    json_error(400, 'Âge invalide.');
}

// ── Vérification Cloudflare Turnstile ────────────────────────────────────────
$ip = $_SERVER['HTTP_X_FORWARDED_FOR']
    ? explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]
    : ($_SERVER['REMOTE_ADDR'] ?? '');

$captcha = http_post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
    'secret'   => BPC_TURNSTILE_SECRET,
    'response' => $turnstileToken,
    'remoteip' => trim($ip),
], 'form');

if (empty($captcha['success'])) {
    json_error(400, 'Vérification anti-bot échouée. Réessaie.');
}

// ── Sanitisation ─────────────────────────────────────────────────────────────
$safeName    = sanitize($name);
$safeEmail   = sanitize($email);
$safeFormula = sanitize($formula);
$safeLevel   = sanitize($level);
$safeMessage = sanitize($message);

// ── Email admin ──────────────────────────────────────────────────────────────
$adminHtml = <<<HTML
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#FF6B00;margin-bottom:24px">Nouvelle demande d'inscription</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:10px 0;color:#666;width:120px">Nom</td>
      <td style="padding:10px 0;font-weight:600">{$safeName}</td>
    </tr>
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:10px 0;color:#666">Email</td>
      <td style="padding:10px 0"><a href="mailto:{$safeEmail}">{$safeEmail}</a></td>
    </tr>
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:10px 0;color:#666">Âge</td>
      <td style="padding:10px 0">{$ageNum} ans</td>
    </tr>
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:10px 0;color:#666">Formule</td>
      <td style="padding:10px 0">{$safeFormula}</td>
    </tr>
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:10px 0;color:#666">Niveau</td>
      <td style="padding:10px 0">{$safeLevel}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#666;vertical-align:top">Message</td>
      <td style="padding:10px 0">{$safeMessage}</td>
    </tr>
  </table>
  <p style="margin-top:24px;color:#999;font-size:12px">
    Envoyé via le formulaire BasketBall Player Camp
  </p>
</div>
HTML;

$adminResult = send_email(
    from:    'noreply@' . BPC_EMAIL_DOMAIN,
    to:      BPC_ADMIN_EMAIL,
    replyTo: $safeEmail,
    subject: "🏀 Nouvelle inscription — {$safeName}",
    html:    $adminHtml
);

if (!$adminResult) {
    json_error(500, 'Erreur lors de l\'envoi. Réessaie plus tard.');
}

// ── Email de confirmation au participant ─────────────────────────────────────
$confirmHtml = <<<HTML
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0A0A0A;color:#fff">
  <h1 style="color:#FF6B00;font-size:2rem;margin-bottom:8px">BASKETBALL PLAYER CAMP 🏀</h1>
  <h2 style="font-weight:400;margin-bottom:24px;color:#ccc">Demande reçue !</h2>
  <p style="font-size:1.1rem">Salut <strong>{$safeName}</strong> !</p>
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
HTML;

send_email(
    from:    'noreply@' . BPC_EMAIL_DOMAIN,
    to:      $safeEmail,
    replyTo: null,
    subject: '✅ Ta demande a bien été reçue — BasketBall Player Camp',
    html:    $confirmHtml
);

// ── Succès ───────────────────────────────────────────────────────────────────
echo json_encode(['success' => true]);
exit;


// ════════════════════════════════════════════════════════════════════════════
// Fonctions utilitaires
// ════════════════════════════════════════════════════════════════════════════

function sanitize(string $str): string
{
    return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8');
}

function json_error(int $code, string $message): never
{
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

/**
 * Envoie un email via l'API REST Resend.
 */
function send_email(string $from, string $to, ?string $replyTo, string $subject, string $html): bool
{
    $payload = [
        'from'    => 'BasketBall Player Camp <' . $from . '>',
        'to'      => [$to],
        'subject' => $subject,
        'html'    => $html,
    ];
    if ($replyTo) {
        $payload['reply_to'] = $replyTo;
    }

    $result = http_post(
        'https://api.resend.com/emails',
        $payload,
        'json',
        ['Authorization: Bearer ' . BPC_RESEND_API_KEY]
    );

    return isset($result['id']);
}

/**
 * Effectue une requête POST HTTP via cURL.
 *
 * @param string $url
 * @param array  $data
 * @param string $type    'json' ou 'form'
 * @param array  $headers Headers HTTP supplémentaires
 */
function http_post(string $url, array $data, string $type = 'json', array $headers = []): array
{
    $ch = curl_init($url);

    if ($type === 'json') {
        $body = json_encode($data);
        $headers[] = 'Content-Type: application/json';
    } else {
        $body = http_build_query($data);
        $headers[] = 'Content-Type: application/x-www-form-urlencoded';
    }

    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_HTTPHEADER     => $headers,
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response ?: '{}', true) ?? [];
}
