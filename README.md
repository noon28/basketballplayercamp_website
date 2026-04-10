# 🏀 BasketBall Player Camp — Site Web Officiel

Site web de promotion et d'inscription pour le **BasketBall Player Camp**, camp de basket organisé en France avec coaching d'un joueur professionnel.

---

## Aperçu

Camp de basket en France, organisé en association par **Pierre Augustin** (coach diplômé) et **Hugo Bequignon** (joueur pro Élite 2 — ASA Alsace), avec équipement Nike.

### 3 formules
- **Stage été** — 1 semaine ou 2 semaines (9h–17h)
- **Stage vacances** — en partenariat avec CBC (Compétences Basketball Camp)
- **Perfectionnement tir** — à venir

### Ce que propose le camp
- Machines à shoot dernière génération
- Entraînements de tir intensifs
- Coaching direct avec un joueur professionnel
- Vidéo analyse, préparation physique, tournoi final

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | HTML5 / CSS3 / JavaScript vanilla |
| Hébergement | [OVH mutualisé Starter](https://www.ovhcloud.com/fr/web-hosting/) |
| Backend | PHP 8+ (Apache + cURL) |
| Emails | [Resend](https://resend.com) (3 000 emails/mois gratuit) |
| CAPTCHA | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) (gratuit) |
| Feed Instagram | [Behold.so](https://behold.so) (gratuit) |

---

## Structure des fichiers

```
basketballplayercamp_website/
├── index.html              # Page principale
├── formule-ete.html        # Page dédiée stage été
├── formule-vacances.html   # Page dédiée stage vacances
├── formule-tir.html        # Page dédiée perfectionnement tir
├── .htaccess               # Sécurité OVH (HTTPS forcé, cache, headers)
├── css/
│   ├── style.css           # Styles (dark theme, responsive)
│   └── formules.css        # Styles des pages formules
├── js/
│   └── main.js             # Interactions, formulaire
├── api/
│   ├── .htaccess           # Rewrite /api/register → register.php + protection config
│   ├── register.php        # Handler formulaire (PHP 8, Resend via cURL)
│   ├── config.php          # Clés secrètes — dans .gitignore, ne jamais commit
│   └── config.example.php  # Template config à copier
└── images/
    ├── hero.jpg
    ├── about.jpg
    ├── coach.jpg           # Hugo Bequignon
    ├── pierre-augustin.jpg # Pierre Augustin (B&W via CSS)
    ├── gallery-*.jpg       # Galerie (6 photos)
    └── logo/
        ├── camp/
        │   ├── LogoCouleurBasket.png   # Logo principal (nav + favicon)
        │   ├── Logo summercamp.png     # Logo Summer Camp
        │   └── LogoSkillsUp.png        # Logo Skills Up
        └── Partenaires/
            ├── partner-jt-immo.PNG
            ├── partner-art-sucre.PNG
            ├── partner-civette.PNG
            ├── partner-credit-agricole.png
            ├── partner-douce-escapade.JPEG
            ├── partner-montebianco.PNG
            ├── partner-renou.JPEG
            ├── partner-tartine-gourmandise.JPG
            └── patner-rousseau.JPG
```

---

## Lancer en local

Frontend uniquement :

```bash
python3 -m http.server 3000
# → http://localhost:3000
```

> Le backend PHP ne peut pas tourner via cette commande. Pour tester le formulaire en local, utiliser MAMP ou XAMPP. En pratique, le plus simple est de tester directement en production sur OVH.

---

## Configuration PHP

Copier `api/config.example.php` en `api/config.php` et renseigner les clés :

```bash
cp api/config.example.php api/config.php
```

| Constante | Description | Où l'obtenir |
|-----------|-------------|--------------|
| `BPC_RESEND_API_KEY` | Clé API Resend | [resend.com](https://resend.com) → API Keys |
| `BPC_ADMIN_EMAIL` | Email qui reçoit les inscriptions | — |
| `BPC_EMAIL_DOMAIN` | Domaine expéditeur vérifié | Dashboard Resend |
| `BPC_TURNSTILE_SECRET` | Clé secrète Cloudflare Turnstile | [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile |
| `BPC_ALLOWED_ORIGIN` | Domaine autorisé pour CORS | Ton domaine OVH en prod |

> Les clés de test Cloudflare Turnstile sont pré-remplies pour le développement local.

> ⚠️ `api/config.php` est dans `.gitignore` — ne jamais le commit. Le déposer manuellement sur OVH via FTP.

---

## Déploiement sur OVH

1. **Configurer** `api/config.php` avec tes vraies clés (cf. section ci-dessus)
2. **Uploader tous les fichiers** via FTP (FileZilla, Cyberduck, ou le gestionnaire de fichiers OVH)
3. **Déposer `api/config.php` manuellement** via FTP — ne pas passer par git
4. **Vérifier le domaine** dans Resend (Dashboard Resend → Domains) pour pouvoir envoyer depuis `noreply@tondomaine.fr`

### Accès FTP OVH
Les identifiants FTP sont disponibles dans l'espace client OVH :  
**Hébergements → ton hébergement → FTP-SSH**

---

## Configurer le feed Instagram

1. Créer un compte sur [behold.so](https://behold.so)
2. Connecter le compte Instagram `@basketball_player_camp`
3. Copier le **Feed ID** généré
4. Dans `index.html`, remplacer `VOTRE_FEED_ID` :
   ```html
   <div id="behold-widget-VOTRE_FEED_ID" class="instagram__feed"></div>
   ```
5. Décommenter la ligne script juste en dessous

> Le compte Instagram doit être en mode **Creator** ou **Business**.

---

## Configurer le CAPTCHA en production

1. Créer un site sur [Cloudflare Turnstile](https://dash.cloudflare.com/turnstile)
2. Remplacer la **Site Key** dans `index.html` et les pages formules :
   ```html
   data-sitekey="TA_VRAIE_SITE_KEY"
   ```
3. Mettre la **Secret Key** dans `api/config.php` → `BPC_TURNSTILE_SECRET`

---

## Mode démo

Pour une présentation animée (auto-scroll) :

```
http://localhost:3000?demo
```

Utile pour enregistrer une vidéo de présentation avec QuickTime (`⌘ Shift 5`).

---

## Changelog

### Avril 2026
- **Logos sans cercle** — Suppression des conteneurs ronds (`border-radius: 50%`, `overflow: hidden`, `transform: scale`) sur les logos des cartes formules (index.html), le badge de la section "À propos", et les pages formules. Les logos s'affichent désormais directement avec `object-fit: contain` et un `drop-shadow` pour les détacher visuellement.
- **Mise à jour des logos partenaires** — Remplacement des anciens fichiers JPEG par de nouveaux PNG/JPEG de meilleure qualité. Ajout de 7 nouveaux partenaires : La Civette, Crédit Agricole Val de France, Douce Escapade, Pizza Monte Bianco, Renou Automobiles, Tartines & Gourmandises, Rousseau. Suppression du partenariat CBC (Châteaudun Basket).
- **Renommage "Stage Intensif Été" → "Summer Camp"** — Harmonisation du nom sur toutes les pages et dans le CSS.
- **Galerie étendue** — Ajout de photos réelles du camp.

---

## Licence

Voir [LICENSE](./LICENSE) — Tous droits réservés.  
Le code, les visuels, les photos et la marque **BasketBall Player Camp** sont protégés.
