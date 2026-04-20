# Guide de déploiement — Cloudflare Pages + Auth Discord

## Vue d'ensemble des fichiers modifiés

```
assets/js/config.js      → Guilde 2 + sélecteur de guilde
assets/js/app.js         → Utilise getSheets() (guilde active)
_includes/nav.html       → Boutons G1 / G2 dans la nav
index.html               → Bannière sélecteur de guilde
functions/_middleware.js → (NOUVEAU) Protection du site
functions/auth/login.js  → (NOUVEAU) Initie le login Discord
functions/auth/callback.js → (NOUVEAU) Valide le membre + cookie
worker/wrangler.toml     → Variables guilde 2
worker/src/commands.js   → Bot : détecte G1/G2 via rôle
```

---

## ÉTAPE 1 — Google Sheets : créer les onglets Guilde 2

Dans ta feuille Google Sheets existante, duplique ces onglets :

| Copier cet onglet | Renommer la copie en |
|---|---|
| Membres   | Membres2   |
| GDG       | GDG2       |
| Annonces  | Annonces2  |
| Absences  | Absences2  |
| Tierlist  | Tierlist2  |

La structure des colonnes doit être identique.

---

## ÉTAPE 2 — Discord Developer Portal

1. Va sur https://discord.com/developers/applications
2. Clique sur ton application (le bot Purgatoire)
3. Menu **OAuth2** → **General**
4. Dans "Redirects", clique "Add Redirect" et colle :
   ```
   https://TON-PROJET.pages.dev/auth/callback
   ```
   (remplace TON-PROJET par le nom de ton projet Cloudflare Pages)
5. Copie le **Client ID** (visible en haut)
6. Clique "Reset Secret" → copie le **Client Secret**
   ⚠️ Il ne sera plus visible après avoir fermé la page

---

## ÉTAPE 3 — Récupérer l'ID du rôle Guilde 2

Dans Discord :
1. Paramètres serveur → Rôles
2. Clic droit sur le rôle "Guilde 2" (ou l'équivalent)
3. "Copier l'identifiant du rôle"
4. Garde-le de côté pour l'étape 5

---

## ÉTAPE 4 — Cloudflare Pages : connecter le repo

1. Va sur https://dash.cloudflare.com → **Pages** → "Create a project"
2. "Connect to Git" → sélectionne ton repo GitHub
3. Paramètres de build :
   - **Framework preset** : Jekyll
   - **Build command** : `jekyll build`
   - **Build output directory** : `_site`
4. Clique "Save and Deploy" — le premier déploiement peut échouer (pas grave)

---

## ÉTAPE 5 — Variables d'environnement Cloudflare Pages

Dans le dashboard Pages → ton projet → **Settings** → **Environment variables**

Ajoute ces variables (toutes en "Production" ET "Preview") :

| Variable | Valeur |
|---|---|
| `DISCORD_CLIENT_ID` | Le Client ID de l'étape 2 |
| `DISCORD_CLIENT_SECRET` | Le Client Secret de l'étape 2 |
| `SESSION_SECRET` | Une chaîne aléatoire longue (ex: génère sur https://randomkeygen.com/) |
| `GUILD_ID` | `1488740561262477474` (déjà dans le code) |
| `ROLE_GUILD2` | L'ID de rôle de l'étape 3 |

---

## ÉTAPE 6 — Mettre à jour le Worker (bot Discord)

Dans le dossier `worker/` :

```bash
# Si pas encore installé
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login

# Mettre à jour les secrets (s'ils ont changé)
wrangler secret put DISCORD_TOKEN
wrangler secret put DISCORD_PUBLIC_KEY
wrangler secret put GOOGLE_PRIVATE_KEY

# Déployer le worker mis à jour
wrangler deploy
```

Dans `worker/wrangler.toml`, remplace :
- `GUILD_ID_2` → l'ID de ton serveur Discord guilde 2 (si serveur séparé) ou laisse vide
- `ROLE_GUILD2` → l'ID du rôle guilde 2 (étape 3)

---

## ÉTAPE 7 — Copier les fichiers dans ton repo

Copie tous ces fichiers dans ton repo GitHub :

```
Ton repo/
├── functions/
│   ├── _middleware.js        ← NOUVEAU
│   └── auth/
│       ├── login.js          ← NOUVEAU
│       └── callback.js       ← NOUVEAU
├── assets/js/
│   ├── config.js             ← MODIFIÉ
│   └── app.js                ← MODIFIÉ
├── _includes/
│   └── nav.html              ← MODIFIÉ
├── index.html                ← MODIFIÉ
└── worker/
    ├── wrangler.toml         ← MODIFIÉ
    └── src/
        └── commands.js       ← MODIFIÉ
```

Puis `git add . && git commit -m "feat: guild 2 + cloudflare auth" && git push`

Cloudflare Pages redéploie automatiquement.

---

## ÉTAPE 8 — Vérifier que ça marche

1. Ouvre ton site en navigation privée
2. Tu devrais être redirigé vers Discord pour te connecter
3. Après le login Discord, tu reviens sur le site
4. Si tu n'es pas membre de la guilde → redirect vers `/join`
5. Si tu es membre → accès normal

---

## Dépannage courant

**"Redirect URI mismatch"** → L'URL dans Discord OAuth2 ne correspond pas exactement à `https://TON-PROJET.pages.dev/auth/callback`

**Boucle infinie de redirections** → Vérifie que `SESSION_SECRET` est bien défini dans les variables Pages

**Pages publiques bloquées** → Vérifie le tableau `PUBLIC_PATHS` dans `functions/_middleware.js`

**Bot n'écrit pas dans Membres2** → Vérifie que `ROLE_GUILD2` dans wrangler.toml correspond bien au rôle Discord

---

## Pages publiques (accessibles sans compte)

- `/` — Accueil
- `/join` — Rejoindre la guilde
- `/pages/recrutement/` — Formulaire de recrutement
- `/pages/wiki/` — Wiki
- `/pages/calendrier/` — Calendrier des events

Pour ajouter d'autres pages publiques, modifie le tableau `PUBLIC_PATHS` dans `functions/_middleware.js`.
