#!/bin/bash

# Navigate to backend directory
cd /home/sanjai-kumar/fast-and-furious/app/backend

# Activate virtual environment
source venv/bin/activate

# Set Flask app environment variable
export FLASK_APP=main.py

# Run Flask application
echo "🚀 Starting Flask backend..."
echo "📍 Backend will be available at: http://localhost:5000"
echo "🔧 Debug mode: ON"
echo ""

python main.py 