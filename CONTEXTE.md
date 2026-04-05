# Contexte complet — Basketball Player Camp Website

Fichier de référence pour reprendre le projet rapidement.  
Dernière mise à jour : avril 2026.

---

## 1. Le projet

Site web pour le camp de basket **Basketball Player Camp**, basé en France.  
Structure juridique : **association**.

### Les 2 fondateurs

| Personne | Rôle | Photo |
|----------|------|-------|
| **Pierre Augustin** | Coach diplômé | `images/pierre-augustin.jpg` (affichée en noir & blanc via CSS) |
| **Hugo Bequignon** | Joueur pro Élite 2 — club ASA Alsace | `images/coach.jpg` |

### 3 formules proposées

1. **Stage été** — 1 semaine ou 2 semaines, 9h–17h. Card avec planning détaillé.
2. **Stage vacances** — En partenariat avec **CBC** (Compétences Basketball Camp).
3. **Perfectionnement tir** — Pas encore lancé, affiché "Prochainement" (style dashed/opaque).

### Partenaires intégrés

| Partenaire | Logo | Note CSS |
|------------|------|----------|
| JT Immo | `images/logo/partner-jt-immo.jpeg` | Class `partner-slot--white` (fond blanc pour JPEG) |
| Art Sucré | `images/logo/partner-art-sucre.png` | PNG transparent, pas besoin de fond |
| 4 slots vides | — | À compléter quand de nouveaux partenaires arrivent |

### Instagram

Compte : **@basketball_player_camp**

---

## 2. Stack technique

| Composant | Technologie | Coût |
|-----------|-------------|------|
| Frontend | HTML5 / CSS3 / JS vanilla | Gratuit |
| Hébergement | **Vercel** (serverless) | Gratuit (hobby) |
| Emails | **Resend** API | Gratuit (3000/mois) |
| CAPTCHA | **Cloudflare Turnstile** | Gratuit |
| Feed Instagram | **Behold.so** widget | Gratuit (250 loads/mois) |
| Repo | GitHub — `noon28/basketballplayercamp_website` | Gratuit |
| Visualisation | GitHub Pages (frontend uniquement) | Gratuit |

### Design

- Fond : `#0A0A0A` (noir profond)
- Accent : `#FF6B00` (orange)
- Police : **Barlow Condensed** (Google Fonts)
- Thème : dark, moderne, orienté basket

---

## 3. Arborescence des fichiers

```
basketballplayercamp_website/
│
├── index.html                  ← Page principale (tout le site est une SPA)
├── css/
│   └── style.css               ← Styles (~700+ lignes)
├── js/
│   └── main.js                 ← Nav scroll, burger, reveal, counter, démo, protection images, formulaire
├── api/
│   └── register.js             ← Serverless function Vercel (Node.js ESM)
│
├── images/
│   ├── hero.jpg                ← Joueur qui dunk (salle sombre)
│   ├── about.jpg               ← Balles Spalding
│   ├── coach.jpg               ← Hugo Bequignon (ASA)
│   ├── pierre-augustin.jpg     ← Pierre Augustin (uploadé par le user)
│   ├── gallery-1.jpg           ← Galerie basket (1 à 6)
│   ├── gallery-2.jpg
│   ├── gallery-3.jpg
│   ├── gallery-4.jpg
│   ├── gallery-5.jpg
│   ├── gallery-6.jpg
│   └── logo/
│       ├── LogoCouleurBasket.jpg   ← Logo principal (nav circulaire + favicon)
│       ├── LogoNoirBasket.jpg
│       ├── logoGrisBasket.jpg
│       ├── partner-jt-immo.jpeg    ← Partenaire JT Immo
│       └── partner-art-sucre.png   ← Partenaire Art Sucré
│
├── vercel.json                 ← Config Vercel (runtime node20, routes)
├── package.json                ← { "type": "module", "dependencies": { "resend": "^3.2.0" } }
├── .env                        ← Variables locales (gitignorées)
├── .env.example                ← Template public
├── .gitignore                  ← .env, node_modules, .DS_Store, .vercel, .claude
├── Dockerfile                  ← nginx:alpine (option auto-hébergement)
├── docker-compose.yml
├── nginx.conf
├── LICENSE                     ← Licence propriétaire (photos, branding, droit français)
└── README.md                   ← Guide de setup complet
```

---

## 4. Sections du site (index.html)

| Section | Contenu |
|---------|---------|
| **Nav** | Logo circulaire + "BBALL PLAYER" + liens (Le Camp, Formules, Équipe, Photos, Instagram, Réserver) |
| **Hero** | `hero.jpg` en fond (opacity 0.35) + overlay gradient + lignes de terrain CSS + titre "ÉLÈVE TON NIVEAU DE JEU" |
| **Stats** | 3 formules / 2 fondateurs / 9h–17h / Nike |
| **About** | Description association, 4 bullet points, logo badge sur photo |
| **Formules** | 3 cards (été avec planning, vacances CBC, tir "Prochainement") |
| **Équipe** | Pierre Augustin (B&W, coach diplômé) + Hugo Bequignon (couleur, Élite 2 ASA) |
| **Galerie** | 6 photos basket |
| **Instagram** | @basketball_player_camp + bouton + widget Behold.so (à configurer) |
| **Citation** | Hugo Bequignon |
| **Partenaires** | JT Immo + Art Sucré + 4 slots vides |
| **Formulaire** | Prénom/Nom, Email, Âge, Formule, Niveau, Message + Cloudflare Turnstile |
| **Footer** | Logo + liens + IG @basketball_player_camp |

---

## 5. Backend — api/register.js

Serverless function Vercel (ESM, Node.js 20).

**Flux :**
1. Valide les champs obligatoires (nom, email, âge, token CAPTCHA)
2. Vérifie le token Cloudflare Turnstile
3. Sanitise les inputs (échappe `<` et `>`)
4. Envoie un email de notification à l'admin (via Resend, `replyTo` = email participant)
5. Envoie un email de confirmation au participant
6. Retourne `{ success: true }` ou `{ error: "..." }`

**Variables d'environnement requises :**

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=ton@email.com
EMAIL_DOMAIN=tondomaine.com
TURNSTILE_SECRET_KEY=0xAAAAA...
ALLOWED_ORIGIN=https://tondomaine.com
```

---

## 6. Branches git

| Branche | État | Description |
|---------|------|-------------|
| `main` | Archivée | V1 mockup initial |
| `v2-concept` | **Active** | Version complète avec vrai contenu |

Repo : `https://github.com/noon28/basketballplayercamp_website.git`  
Credentials : macOS Keychain (`git config --global credential.helper osxkeychain`)

---

## 7. Dev local

### Frontend uniquement (sans Node.js)
```bash
python3 -m http.server 3000
# → http://localhost:3000
```

### Frontend + API (avec Node.js)
```bash
npm install
npm install -g vercel
vercel dev
# → http://localhost:3000
```

### Mode démo
Ajoute `?demo` à l'URL → auto-scroll entre les sections + bannière orange.  
Exemple : `http://localhost:3000?demo`

---

## 8. Protection des images

### CSS (style.css)
```css
img {
  pointer-events: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
  user-select: none;
}
.gallery__item::after { /* overlay transparent */ }
.gallery__item::before { /* watermark © BasketBall Player Camp */ }
```

### JS (main.js)
- `contextmenu` bloqué sur les `<img>`
- `dragstart` bloqué sur les `<img>`
- `Cmd+S` et `Cmd+U` bloqués
- `draggable="false"` sur toutes les images
- `selectstart` bloqué

---

## 9. Tâches en attente

### À faire par le user (actions manuelles)

- [ ] **GitHub Pages** — Settings → Pages → branch `v2-concept` → URL : `https://noon28.github.io/basketballplayercamp_website/`
- [ ] **Behold.so** — Créer compte, connecter @basketball_player_camp, copier le Feed ID, remplacer `VOTRE_FEED_ID` dans index.html, décommenter le `<script>` Behold
- [ ] **Resend** — Créer compte sur resend.com, obtenir API key, mettre dans `.env` + variables Vercel
- [ ] **Cloudflare Turnstile** — Remplacer la clé de test `1x00000000000000000000AA` par une vraie clé site (prod)
- [ ] **Dates du stage** — Définir et ajouter les dates du stage d'été dans les cards Formules
- [ ] **Logos partenaires** — 4 slots vides dans la section partenaires à compléter
- [ ] **Node.js** — Installer via nvm (`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`)

### À faire avec Claude

- [ ] Système de **réservation / paiement** (pas encore abordé)
- [ ] **Photos officielles** du camp une fois les stages lancés (remplacer photos stock)
- [ ] Ajout des dates et des **prix** dans les formules
- [ ] Intégration des **4 logos partenaires** supplémentaires

---

## 10. Déploiement Vercel (quand prêt)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Puis dans le dashboard Vercel, ajouter les variables d'environnement :
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `EMAIL_DOMAIN`
- `TURNSTILE_SECRET_KEY`
- `ALLOWED_ORIGIN` (URL Vercel assignée)

---

## 11. Notes techniques importantes

- **Noms de fichiers** : pas d'espaces ni d'accents (renommés en `partner-jt-immo.jpeg`, `partner-art-sucre.png`, `pierre-augustin.jpg`)
- **Logos JPEG à fond blanc** : utiliser la class CSS `partner-slot--white` → `background: white`
- **Photo B&W Pierre Augustin** : class `team-card__img-wrap--bw` → `filter: grayscale(1)` en CSS
- **package.json** doit avoir `"type": "module"` pour que l'ESM fonctionne dans Vercel
- **Clés Turnstile de test** : `site=1x00000000000000000000AA` / `secret=1x0000000000000000000000000000000AA` (toujours valides en dev)
