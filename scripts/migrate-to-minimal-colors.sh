#!/bin/bash

echo "🎨 Migrating to Ultra Minimal 3-Color System..."
echo "================================================"

# Find all relevant files (excluding node_modules, .next, etc.)
FILES=$(find app components -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) 2>/dev/null)

echo "📦 Phase 1: Replacing brand shade variants with 'brand'"
for shade in 50 100 200 300 400 500 600 700 800 900; do
  for file in $FILES; do
    # Text colors
    sed -i '' "s/text-brand-${shade}/text-brand/g" "$file" 2>/dev/null
    # Background colors
    sed -i '' "s/bg-brand-${shade}/bg-brand/g" "$file" 2>/dev/null
    # Border colors
    sed -i '' "s/border-brand-${shade}/border-brand/g" "$file" 2>/dev/null
    # Ring colors
    sed -i '' "s/ring-brand-${shade}/ring-brand/g" "$file" 2>/dev/null
    # Hover states
    sed -i '' "s/hover:text-brand-${shade}/hover:text-brand/g" "$file" 2>/dev/null
    sed -i '' "s/hover:bg-brand-${shade}/hover:bg-brand/g" "$file" 2>/dev/null
    sed -i '' "s/hover:border-brand-${shade}/hover:border-brand/g" "$file" 2>/dev/null
    # Focus states
    sed -i '' "s/focus:border-brand-${shade}/focus:border-brand/g" "$file" 2>/dev/null
    sed -i '' "s/focus:ring-brand-${shade}/focus:ring-brand/g" "$file" 2>/dev/null
  done
done

echo "🌿 Phase 2: Replacing success/green variants with 'secondary'"
for shade in 50 100 200 300 400 500 600 700 800 900; do
  for file in $FILES; do
    sed -i '' "s/text-success-${shade}/text-secondary/g" "$file" 2>/dev/null
    sed -i '' "s/bg-success-${shade}/bg-secondary/g" "$file" 2>/dev/null
    sed -i '' "s/border-success-${shade}/border-secondary/g" "$file" 2>/dev/null
    sed -i '' "s/text-green-${shade}/text-secondary/g" "$file" 2>/dev/null
    sed -i '' "s/bg-green-${shade}/bg-secondary/g" "$file" 2>/dev/null
    sed -i '' "s/border-green-${shade}/border-secondary/g" "$file" 2>/dev/null
  done
done

echo "🤍 Phase 3: Replacing neutral/gray variants with 'light' or 'white'"
for shade in 50 100; do
  for file in $FILES; do
    sed -i '' "s/bg-neutral-${shade}/bg-light/g" "$file" 2>/dev/null
    sed -i '' "s/bg-gray-${shade}/bg-light/g" "$file" 2>/dev/null
  done
done

# For borders and subtle elements - use light
for shade in 200 300; do
  for file in $FILES; do
    sed -i '' "s/border-neutral-${shade}/border-light/g" "$file" 2>/dev/null
    sed -i '' "s/border-gray-${shade}/border-light/g" "$file" 2>/dev/null
    sed -i '' "s/bg-neutral-${shade}/bg-light/g" "$file" 2>/dev/null
  done
done

# For text colors - use default text color (remove neutral/gray text classes)
for shade in 400 500 600 700 800 900; do
  for file in $FILES; do
    # Replace with default text color (no class)
    sed -i '' "s/text-neutral-${shade}/text-gray-900/g" "$file" 2>/dev/null
    sed -i '' "s/text-gray-${shade}/text-gray-900/g" "$file" 2>/dev/null
  done
done

echo "🔴 Phase 4: Replacing error/red/warning/info with opacity variants"
for shade in 50 100 500 600 700; do
  for file in $FILES; do
    # Error states - use brand with opacity
    sed -i '' "s/text-error-${shade}/text-red-600/g" "$file" 2>/dev/null
    sed -i '' "s/bg-error-${shade}/bg-red-50/g" "$file" 2>/dev/null
    sed -i '' "s/border-error-${shade}/border-red-600/g" "$file" 2>/dev/null
    
    # Warning states - use brand with opacity
    sed -i '' "s/text-warning-${shade}/text-orange-600/g" "$file" 2>/dev/null
    sed -i '' "s/bg-warning-${shade}/bg-orange-50/g" "$file" 2>/dev/null
    
    # Info states - use brand
    sed -i '' "s/text-info-${shade}/text-brand/g" "$file" 2>/dev/null
    sed -i '' "s/bg-info-${shade}/bg-brand\/10/g" "$file" 2>/dev/null
    sed -i '' "s/border-info-${shade}/border-brand/g" "$file" 2>/dev/null
  done
done

echo "✅ Migration complete!"
echo ""
echo "Color system reduced to:"
echo "  • brand (#0094da) - Primary actions"
echo "  • secondary (#10b981) - Success/accents"
echo "  • light (#f9fafb) - Backgrounds/borders"
echo ""
echo "⚡ This will significantly reduce your CSS bundle size!"
