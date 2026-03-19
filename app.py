"""
VÉRONIQUE — Collection Digitale
app.py — Routes uniquement, pas de base de données
"""

import os
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_wtf.csrf import CSRFProtect
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-prod')

csrf = CSRFProtect(app)


# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/collection')
def collection():
    return render_template('collection.html')


@app.route('/transformation')
def transformation():
    return render_template('transformation.html')


@app.route('/atelier')
def atelier():
    return render_template('atelier.html')


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    erreurs = []
    form_data = {}

    if request.method == 'POST':
        nom     = request.form.get('nom', '').strip()
        email   = request.form.get('email', '').strip()
        message = request.form.get('message', '').strip()
        form_data = request.form

        if not nom:
            erreurs.append('Le nom est requis.')
        if not email or '@' not in email:
            erreurs.append('Un email valide est requis.')
        if not message:
            erreurs.append('Le message est requis.')

        if not erreurs:
            # Pas de BDD — on affiche juste un message de confirmation
            flash('Message envoyé avec succès. Nous vous répondrons bientôt.', 'success')
            return redirect(url_for('contact'))

    return render_template('contact.html', erreurs=erreurs, form_data=form_data)


# ─────────────────────────────────────────
# POINT D'ENTRÉE
# ─────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_ENV') != 'production',
            host='0.0.0.0', port=5000)