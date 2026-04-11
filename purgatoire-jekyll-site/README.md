# Purgatoire — Jekyll site

Structure Jekyll prête pour GitHub Pages, pensée pour une guilde 7DS Origin.

## Ce qui est inclus
- Design dark fantasy noir / violet / or
- Accueil
- Roster
- GDG
- Annonces
- Calendrier
- Recrutement
- Utilisation exclusive des visuels fournis

## Images utilisées
- `assets/images/hero.png`
- `assets/images/banner.png`

## Mise en ligne GitHub Pages
1. Crée un dépôt GitHub public.
2. Dépose tous les fichiers à la racine.
3. Active GitHub Pages depuis `main` / root.
4. Si besoin, ajuste `baseurl` dans `_config.yml`.

## Brancher Google Sheets
Ouvre `assets/js/config.js` et remplace les URLs placeholders.

Onglets recommandés :
- `Membres`
- `GDG`
- `Annonces`

Format attendu :
### Membres
`pseudo,cc,main_char,grade,statut,updated_at`

### GDG
`date,ennemi,resultat,notre_score,score_ennemi,notes`

### Annonces
`date,titre,categorie,resume,lien_notion,lien_fichier,image,epingle,publie`

## Recrutement
Dans `assets/js/config.js`, remplace :
- `discordInvite`
- `googleFormUrl`
- `calendarEmbedUrl`

## Remarques
- Le site est statique, mais les tableaux et cartes peuvent lire des CSV publiés depuis Google Sheets.
- Les pages non alimentées affichent un état vide propre.
