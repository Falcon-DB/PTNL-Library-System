from flask import Flask, render_template
from flask_cors import CORS

from routes.auth.auth_routes import auth_bp
from routes.query.query_routes import query_bp
from routes.subscription.subscription_routes import subscription_bp
from routes.feedback.feedback_routes import feedback_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(subscription_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(query_bp)
app.register_blueprint(feedback_bp)

@app.route("/")

def root():
    return render_template("login.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/signup")
def signup_page():
    return render_template("signup.html")

@app.route("/home")
def home_page():
    return render_template("index.html")

@app.route("/profile")
def profile():
    return render_template("profile.html")

@app.route("/feedback")
def feedback():
    return render_template("feedback.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)