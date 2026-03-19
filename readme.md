# Collection Véronique

Site de mode pour la Collection Véronique — Bijoux artisanaux en canettes recyclées.

---

## Structure

```
/project
  app.py                  ← Backend Flask complet
  requirements.txt        ← Dépendances Python
  render.yaml             ← Config déploiement Render
  .env.example            ← Modèle variables d'environnement
  .gitignore

  /static
    /css
      base.css            ← Variables, reset, nav, footer
      index.css
      collection.css
      transformation.css
      atelier.css
      contact.css
    /images               ← Mettre vos images ici
    /videos               ← Mettre vos vidéos ici

  /templates
    index.html
    collection.html
    transformation.html
    atelier.html
    contact.html
```

---

## Lancer en local

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd project

# 2. Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Créer le fichier .env
cp .env.example .env
# Editer .env avec votre SECRET_KEY

# 5. Lancer
python app.py
# → http://localhost:5000
```

---

## Images à préparer

Placer dans `/static/images/` :

| Fichier | Page | Usage |
|---|---|---|
| `hero.jpg` | Accueil | Hero fullscreen |
| `a.jpg` → `j.jpg` | Collection | Photos des bijoux |
| `atelier.jpg` | Accueil | Teaser atelier |
| `atelier-hero.jpg` | Atelier | Hero de la page |
| `step1.jpg` → `step4.jpg` | Atelier | Étapes du processus |
| `bs1.jpg` → `bs6.jpg` | Atelier | Photos backstage |
| `av1.jpg` → `av4.jpg` | Transformation | Photos "avant" |
| `ap1.jpg` → `ap4.jpg` | Transformation | Photos "après" |
| `og.jpg` | Toutes | Partage réseaux sociaux (1200×630) |

**Format recommandé :** WebP ou JPG, qualité 80%, largeur max 1400px.

---

## Déploiement sur Render

### Option A — Via render.yaml (recommandé)

1. Pousser le code sur GitHub
2. Aller sur [render.com](https://render.com) → New → Blueprint
3. Connecter le repo GitHub
4. Render lit `render.yaml` et crée automatiquement :
   - Le service web Python
   - La base PostgreSQL gratuite
5. Ajouter `SECRET_KEY` dans les variables d'environnement si elle n'est pas auto-générée
6. Déployer ✅

### Option B — Manuellement

1. Render → New → Web Service
2. Connecter le repo GitHub
3. Paramètres :
   - **Runtime :** Python
   - **Build Command :** `pip install -r requirements.txt`
   - **Start Command :** `gunicorn app:app --workers 2 --bind 0.0.0.0:$PORT`
4. Variables d'environnement :
   - `SECRET_KEY` → générer une valeur aléatoire
   - `DATABASE_URL` → URL de la base PostgreSQL Render
5. Ajouter une base PostgreSQL (New → PostgreSQL → Free)
6. Copier l'Internal Database URL dans `DATABASE_URL`
7. Déployer ✅

---

## Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Clé secrète Flask (longue chaîne aléatoire) |
| `DATABASE_URL` | Production | URL PostgreSQL (auto sur Render) |
| `FLASK_ENV` | Non | `production` en prod |

---

## Notes importantes

- Les images uploadées ne persistent pas sur Render (filesystem éphémère). Pour les images permanentes, utiliser un service externe (Cloudinary, AWS S3).
- Le plan gratuit Render met le service en veille après 15min d'inactivité. Premier chargement peut prendre ~30s.