"""
=============================================================
VÉRONIQUE — Collection Digitale
Backend complet : Flask + SQLite/PostgreSQL + Routes + Modèles
=============================================================
"""

import os
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from datetime import datetime
from dotenv import load_dotenv

# ─────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────

load_dotenv()

app = Flask(__name__)

# Clé secrète (CSRF + sessions)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-prod')

# Base de données : SQLite en dev, PostgreSQL en prod
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    # PostgreSQL en production
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    # SQLite en développement
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///veronique.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Upload d'images
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'images', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 Mo max

# Initialisation extensions
db = SQLAlchemy(app)
csrf = CSRFProtect(app)


# ─────────────────────────────────────────
# MODÈLES BASE DE DONNÉES
# ─────────────────────────────────────────

class Collection(db.Model):
    """
    Représente une collection de mode (ex: Véronique)
    """
    __tablename__ = 'collections'

    id          = db.Column(db.Integer, primary_key=True)
    nom         = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    histoire    = db.Column(db.Text)
    date        = db.Column(db.DateTime, default=datetime.utcnow)
    active      = db.Column(db.Boolean, default=True)

    # Relation avec les tenues
    tenues = db.relationship('Tenue', backref='collection', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Collection {self.nom}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'description': self.description,
            'histoire': self.histoire,
            'date': self.date.strftime('%Y-%m-%d'),
            'tenues': [t.to_dict() for t in self.tenues]
        }


class Tenue(db.Model):
    """
    Représente une tenue dans une collection
    """
    __tablename__ = 'tenues'

    id            = db.Column(db.Integer, primary_key=True)
    collection_id = db.Column(db.Integer, db.ForeignKey('collections.id'), nullable=False)
    nom           = db.Column(db.String(100), nullable=False)
    description   = db.Column(db.Text)
    image         = db.Column(db.String(255))         # chemin vers l'image
    image_detail  = db.Column(db.String(255))         # image zoom/détail
    categorie     = db.Column(db.String(50))           # ex: robe, ensemble, accessoire
    ordre         = db.Column(db.Integer, default=0)   # ordre d'affichage

    def __repr__(self):
        return f'<Tenue {self.nom}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'description': self.description,
            'image': self.image,
            'image_detail': self.image_detail,
            'categorie': self.categorie,
            'ordre': self.ordre
        }


class Transformation(db.Model):
    """
    Module avant/après : matière brute → création finale
    Ex: canette → robe
    """
    __tablename__ = 'transformations'

    id          = db.Column(db.Integer, primary_key=True)
    titre       = db.Column(db.String(100), nullable=False)
    avant_image = db.Column(db.String(255))    # matière brute
    apres_image = db.Column(db.String(255))    # création finale
    avant_label = db.Column(db.String(50), default='Avant')
    apres_label = db.Column(db.String(50), default='Après')
    description = db.Column(db.Text)
    ordre       = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<Transformation {self.titre}>'

    def to_dict(self):
        return {
            'id': self.id,
            'titre': self.titre,
            'avant_image': self.avant_image,
            'apres_image': self.apres_image,
            'avant_label': self.avant_label,
            'apres_label': self.apres_label,
            'description': self.description
        }


class AtélierPhoto(db.Model):
    """
    Photos et vidéos backstage de l'atelier
    """
    __tablename__ = 'atelier_photos'

    id          = db.Column(db.Integer, primary_key=True)
    titre       = db.Column(db.String(100))
    description = db.Column(db.Text)
    fichier     = db.Column(db.String(255))       # chemin image ou vidéo
    type        = db.Column(db.String(10), default='image')  # 'image' ou 'video'
    ordre       = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<AtélierPhoto {self.titre}>'

    def to_dict(self):
        return {
            'id': self.id,
            'titre': self.titre,
            'description': self.description,
            'fichier': self.fichier,
            'type': self.type,
            'ordre': self.ordre
        }


class MessageContact(db.Model):
    """
    Messages reçus via le formulaire de contact
    """
    __tablename__ = 'messages_contact'

    id         = db.Column(db.Integer, primary_key=True)
    nom        = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(150), nullable=False)
    telephone  = db.Column(db.String(20))
    sujet      = db.Column(db.String(200))
    message    = db.Column(db.Text, nullable=False)
    date_envoi = db.Column(db.DateTime, default=datetime.utcnow)
    lu         = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Message de {self.nom}>'


# ─────────────────────────────────────────
# ROUTES PRINCIPALES
# ─────────────────────────────────────────

@app.route('/')
def index():
    """Page d'accueil — immersion totale"""
    collection = Collection.query.filter_by(active=True).first()
    return render_template('index.html', collection=collection)


@app.route('/collection')
def collection():
    """Galerie de la Collection Véronique"""
    collection = Collection.query.filter_by(active=True).first()
    if not collection:
        return render_template('collection.html', collection=None, tenues=[])

    tenues = Tenue.query.filter_by(
        collection_id=collection.id
    ).order_by(Tenue.ordre).all()

    return render_template('collection.html', collection=collection, tenues=tenues)


@app.route('/transformation')
def transformation():
    """Module avant/après interactif"""
    transformations = Transformation.query.order_by(Transformation.ordre).all()
    return render_template('transformation.html', transformations=transformations)


@app.route('/atelier')
def atelier():
    """Backstage et storytelling de l'atelier"""
    photos = AtélierPhoto.query.order_by(AtélierPhoto.ordre).all()
    return render_template('atelier.html', photos=photos)


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    """Formulaire de contact et collaboration"""
    if request.method == 'POST':
        nom     = request.form.get('nom', '').strip()
        email   = request.form.get('email', '').strip()
        tel     = request.form.get('telephone', '').strip()
        sujet   = request.form.get('sujet', '').strip()
        message = request.form.get('message', '').strip()

        # Validation basique
        erreurs = []
        if not nom:
            erreurs.append('Le nom est requis.')
        if not email or '@' not in email:
            erreurs.append('Un email valide est requis.')
        if not message:
            erreurs.append('Le message est requis.')

        if erreurs:
            return render_template('contact.html', erreurs=erreurs,
                                   form_data=request.form)

        # Enregistrement en base
        msg = MessageContact(
            nom=nom,
            email=email,
            telephone=tel,
            sujet=sujet,
            message=message
        )
        db.session.add(msg)
        db.session.commit()

        flash('Message envoyé avec succès. Nous vous répondrons bientôt.', 'success')
        return redirect(url_for('contact'))

    return render_template('contact.html', erreurs=[], form_data={})


# ─────────────────────────────────────────
# API JSON (pour appels JS côté client)
# ─────────────────────────────────────────

@app.route('/api/tenues')
def api_tenues():
    """Retourne toutes les tenues en JSON"""
    collection = Collection.query.filter_by(active=True).first()
    if not collection:
        return jsonify([])
    tenues = Tenue.query.filter_by(collection_id=collection.id).order_by(Tenue.ordre).all()
    return jsonify([t.to_dict() for t in tenues])


@app.route('/api/transformations')
def api_transformations():
    """Retourne toutes les transformations en JSON"""
    transformations = Transformation.query.order_by(Transformation.ordre).all()
    return jsonify([t.to_dict() for t in transformations])


@app.route('/api/atelier')
def api_atelier():
    """Retourne les photos/vidéos de l'atelier en JSON"""
    photos = AtélierPhoto.query.order_by(AtélierPhoto.ordre).all()
    return jsonify([p.to_dict() for p in photos])


# ─────────────────────────────────────────
# INITIALISATION BASE DE DONNÉES + DONNÉES DÉMO
# ─────────────────────────────────────────

def init_db():
    """Crée les tables et insère des données de démonstration"""
    db.create_all()

    # Insérer la collection Véronique si elle n'existe pas
    if not Collection.query.first():

        collection = Collection(
            nom='Véronique',
            description='Une collection née de la matière et de l\'audace.',
            histoire=(
                'Véronique est une ode à la transformation. '
                'Chaque pièce raconte l\'histoire d\'une matière réinventée — '
                'canettes, tissus recyclés, fibres naturelles — '
                'sublimées en créations haute couture africaine.'
            )
        )
        db.session.add(collection)
        db.session.flush()

        # Tenues de démonstration
        tenues_demo = [
            Tenue(collection_id=collection.id, nom='Robe Soleil', categorie='robe',
                  description='Éclat doré inspiré du soleil africain.', ordre=1,
                  image='images/placeholder_tenue1.jpg'),
            Tenue(collection_id=collection.id, nom='Ensemble Nuit', categorie='ensemble',
                  description='La nuit urbaine en silhouette structurée.', ordre=2,
                  image='images/placeholder_tenue2.jpg'),
            Tenue(collection_id=collection.id, nom='Cape Harmattan', categorie='cape',
                  description='Mouvement et légèreté du vent saharien.', ordre=3,
                  image='images/placeholder_tenue3.jpg'),
        ]

        # Transformations de démonstration
        transformations_demo = [
            Transformation(
                titre='Canette → Robe',
                avant_label='Canette recyclée',
                apres_label='Robe haute couture',
                description='Des canettes d\'aluminium récupérées, découpées, tissées. Une robe née du déchet.',
                ordre=1
            ),
            Transformation(
                titre='Tissu brut → Ensemble',
                avant_label='Tissu brut',
                apres_label='Ensemble taillé',
                description='Du wax naturel non teint, transformé en ensemble contemporain.',
                ordre=2
            ),
        ]

        # Photos atelier de démonstration
        atelier_demo = [
            AtélierPhoto(titre='Les mains à l\'œuvre', type='image', ordre=1,
                         description='L\'artisane au travail, point par point.'),
            AtélierPhoto(titre='Découpe et assemblage', type='image', ordre=2,
                         description='La précision du geste, l\'exactitude de la vision.'),
            AtélierPhoto(titre='L\'atelier', type='image', ordre=3,
                         description='Là où tout commence.'),
        ]

        db.session.add_all(tenues_demo)
        db.session.add_all(transformations_demo)
        db.session.add_all(atelier_demo)
        db.session.commit()
        print("✅ Base de données initialisée avec données de démo.")


# ─────────────────────────────────────────
# POINT D'ENTRÉE
# ─────────────────────────────────────────

if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)