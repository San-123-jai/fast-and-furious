#!/bin/bash

echo "🛑 Stopping all services..."

# Stop Flask backend
echo "📦 Stopping Flask backend..."
pkill -f "python main.py"

# Stop Vite frontend
echo "🎨 Stopping Vite frontend..."
pkill -f "vite"

# Wait a moment
sleep 2

# Check if any processes are still running
if pgrep -f "python main.py" > /dev/null; then
    echo "⚠️  Some backend processes may still be running"
else
    echo "✅ Backend stopped successfully"
fi

if pgrep -f "vite" > /dev/null; then
    echo "⚠️  Some frontend processes may still be running"
else
    echo "✅ Frontend stopped successfully"
fi

echo "🎯 All services stopped!" 