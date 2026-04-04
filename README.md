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
| Hébergement | [Vercel](https://vercel.com) (gratuit) |
| Emails | [Resend](https://resend.com) (3 000 emails/mois gratuit) |
| CAPTCHA | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) (gratuit) |
| Feed Instagram | [Behold.so](https://behold.so) (gratuit) |
| Docker | nginx:alpine (optionnel) |

---

## Lancer en local

### Avec Python (frontend uniquement)

```bash
python3 -m http.server 3000
# → http://localhost:3000
```

### Avec Vercel CLI (frontend + API)

```bash
npm install
npm install -g vercel
vercel dev
# → http://localhost:3000
```

---

## Variables d'environnement

Copier `.env.example` en `.env` et renseigner les clés :

```bash
cp .env.example .env
```

| Variable | Description | Où l'obtenir |
|----------|-------------|--------------|
| `RESEND_API_KEY` | Clé API Resend | [resend.com](https://resend.com) |
| `ADMIN_EMAIL` | Email qui reçoit les inscriptions | — |
| `EMAIL_DOMAIN` | Domaine expéditeur vérifié | Dashboard Resend |
| `TURNSTILE_SECRET_KEY` | Clé secrète Cloudflare Turnstile | [dash.cloudflare.com](https://dash.cloudflare.com) |
| `ALLOWED_ORIGIN` | Domaine autorisé pour CORS | Ton domaine en prod |

> Les clés de test Cloudflare Turnstile sont pré-remplies pour le développement local.

---

## Déploiement sur Vercel

```bash
vercel --prod
```

Puis ajouter les variables d'environnement dans le dashboard Vercel :
**Settings → Environment Variables**

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
2. Remplacer la **Site Key** dans `index.html` :
   ```html
   data-sitekey="TA_VRAIE_SITE_KEY"
   ```
3. Ajouter la **Secret Key** dans les variables d'environnement Vercel

---

## Branches git

| Branche | Description |
|---------|-------------|
| `main` | V1 initiale — mockup de base |
| `v2-concept` | V2 active — contenu réel, 2 fondateurs, 3 formules, partenaires |

## Structure des fichiers

```
basketballplayercamp_website/
├── index.html              # Page principale
├── css/
│   └── style.css           # Styles (dark theme, responsive)
├── js/
│   └── main.js             # Interactions, formulaire, mode démo
├── api/
│   └── register.js         # Serverless function (Vercel)
├── images/
│   ├── hero.jpg            # Photo hero
│   ├── about.jpg           # Section about
│   ├── coach.jpg           # Hugo Bequignon
│   ├── pierre-augustin.jpg # Pierre Augustin (B&W via CSS)
│   ├── gallery-*.jpg       # Galerie (6 photos)
│   └── logo/
│       ├── LogoCouleurBasket.jpg   # Logo principal (nav + favicon)
│       ├── partner-jt-immo.jpeg    # Partenaire JT Immo
│       └── partner-art-sucre.png   # Partenaire Art Sucré
├── Dockerfile              # Image nginx:alpine
├── docker-compose.yml      # Dev local Docker
├── nginx.conf              # Config nginx
├── vercel.json             # Config Vercel
├── package.json            # Dépendances (resend)
├── .env.example            # Template variables d'environnement
└── .gitignore
```

---

## Mode démo

Pour une présentation animée (auto-scroll) :

```
http://localhost:3000?demo
```

Utile pour enregistrer une vidéo de présentation avec QuickTime (`⌘ Shift 5`).

---

## Visualisation gratuite via GitHub Pages

Activer dans **Settings → Pages → sélectionner la branche `v2-concept`**.  
URL générée : `https://noon28.github.io/basketballplayercamp_website/`

> ⚠️ GitHub Pages = frontend uniquement. Le formulaire d'inscription nécessite Vercel (`vercel --prod`).

---

## Licence

Voir [LICENSE](./LICENSE) — Tous droits réservés.  
Le code, les visuels, les photos et la marque **BasketBall Player Camp** sont protégés.
