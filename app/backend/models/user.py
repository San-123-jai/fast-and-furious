from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import re

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    def set_password(self, password):
        if not self.is_password_complex(password):
            raise ValueError(
                "Password must be at least 8 characters long, "
                "contain an uppercase letter, a lowercase letter, "
                "a digit, and a special character."
            )
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @staticmethod
    def is_password_complex(password):
        # At least 8 chars, one uppercase, one lowercase, one digit, one special char
        if (len(password) < 8 or
            not re.search(r"[A-Z]", password) or
            not re.search(r"[a-z]", password) or
            not re.search(r"\d", password) or
            not re.search(r"[^\w\s]", password)):
            return False
        return True

    @staticmethod
    def is_unique_username(username):
        return User.query.filter_by(username=username).first() is None

    @staticmethod
    def is_unique_email(email):
        return User.query.filter_by(email=email).first() is None

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }
