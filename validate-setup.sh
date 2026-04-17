#!/bin/bash
# Validation Script for 3D Printer Queue System
# Run this to check all required files exist

echo "🔍 Checking project structure..."
echo ""

files=(
  "package.json"
  "vite.config.js"
  "tailwind.config.js"
  "index.html"
  ".env.example"
  ".gitignore"
  "README.md"
  "QUICK_START.md"
  "IMPLEMENTATION_GUIDE.md"
  "src/main.jsx"
  "src/App.jsx"
  "src/styles/index.css"
  "src/pages/LandingPage.jsx"
  "src/pages/StudentSubmission.jsx"
  "src/pages/StudentStatus.jsx"
  "src/pages/Dashboard.jsx"
  "src/pages/AdminLogin.jsx"
  "src/pages/AdminDashboard.jsx"
  "src/components/PrinterCard.jsx"
  "src/components/QueueController.jsx"
  "src/services/firebaseService.js"
  "src/services/firestoreService.js"
  "src/services/authService.js"
  "src/hooks/useRealtimeUpdates.js"
  "src/hooks/usePolling.js"
  "firebase/firestore.rules"
  "firebase/SEED_DATA.js"
  "firebase/functions/index.js"
  "firebase/functions/onJobSubmitted.js"
  "firebase/functions/onJobStatusChange.js"
  "firebase/functions/package.json"
  ".github/workflows/deploy.yml"
)

missing=0
found=0

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
    ((found++))
  else
    echo "❌ MISSING: $file"
    ((missing++))
  fi
done

echo ""
echo "📊 Summary: $found found, $missing missing"
echo ""

if [ $missing -eq 0 ]; then
  echo "✨ All files present! Project is ready."
  echo ""
  echo "Next steps:"
  echo "  1. npm install"
  echo "  2. cp .env.example .env.local (and fill in Firebase config)"
  echo "  3. npm run dev"
  exit 0
else
  echo "⚠️  Some files are missing. Please check the structure."
  exit 1
fi
