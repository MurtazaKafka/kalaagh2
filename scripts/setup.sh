#!/bin/bash

# Kalaagh Platform Setup Script
# This script sets up the development environment for the Kalaagh educational platform

set -e

echo "🌟 Setting up Kalaagh Educational Platform..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install database dependencies
echo "📦 Installing database dependencies..."
cd database
npm install
cd ..

# Setup environment file
echo "⚙️  Setting up environment configuration..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env file from template"
    echo "   Please edit backend/.env with your configuration"
else
    echo "✅ backend/.env file already exists"
fi

# Setup database
echo "🗄️  Setting up database..."
cd database

# Run migrations
echo "   Running database migrations..."
npx knex migrate:latest

# Run seeds
echo "   Seeding database with initial data..."
npx knex seed:run

cd ..

echo ""
echo "🎉 Kalaagh Platform setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Start development servers:"
echo "   npm run dev"
echo ""
echo "Development URLs:"
echo "- Frontend: http://localhost:5173"
echo "- Backend:  http://localhost:3001"
echo "- API Docs: http://localhost:3001/api/docs"
echo ""
echo "For more information, see DEVELOPMENT.md"
echo ""
echo "🌟 Happy coding! Building education for Afghan girls worldwide. 🌟"