#!/bin/bash

# Color Migration Script
# This script helps migrate old color classes to the new standardized system
# Run from project root: bash scripts/migrate-colors.sh

echo "🎨 Starting Color Migration..."
echo ""

# Backup notice
echo "⚠️  IMPORTANT: Make sure you have committed your changes before running this script!"
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Function to replace colors in files
replace_colors() {
    local old_pattern=$1
    local new_pattern=$2
    local description=$3
    
    echo "📝 Replacing $description..."
    
    # Use find and sed to replace in all JSX/TSX/JS/TS files
    find . -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) \
        -not -path "./node_modules/*" \
        -not -path "./.next/*" \
        -not -path "./scripts/*" \
        -exec sed -i '' "s/$old_pattern/$new_pattern/g" {} +
}

# 1. Gray → Neutral migration
echo "🔄 Phase 1: Migrating Gray to Neutral..."
replace_colors "text-gray-" "text-neutral-" "text-gray-* → text-neutral-*"
replace_colors "bg-gray-" "bg-neutral-" "bg-gray-* → bg-neutral-*"
replace_colors "border-gray-" "border-neutral-" "border-gray-* → border-neutral-*"
replace_colors "hover:text-gray-" "hover:text-neutral-" "hover:text-gray-* → hover:text-neutral-*"
replace_colors "hover:bg-gray-" "hover:bg-neutral-" "hover:bg-gray-* → hover:bg-neutral-*"
replace_colors "hover:border-gray-" "hover:border-neutral-" "hover:border-gray-* → hover:border-neutral-*"
echo "✅ Gray → Neutral migration complete"
echo ""

# 2. Red → Error migration (for error states)
echo "🔄 Phase 2: Migrating Red to Error (semantic)..."
replace_colors "bg-red-100 border border-red-400 text-red-700" "bg-error-100 border border-error-500 text-error-700" "error message pattern"
replace_colors "bg-red-100" "bg-error-100" "bg-red-100 → bg-error-100"
replace_colors "text-red-600" "text-error-600" "text-red-600 → text-error-600"
replace_colors "text-red-700" "text-error-700" "text-red-700 → text-error-700"
replace_colors "border-red-400" "border-error-500" "border-red-400 → border-error-500"
replace_colors "hover:bg-red-50" "hover:bg-error-50" "hover:bg-red-50 → hover:bg-error-50"
echo "✅ Red → Error migration complete"
echo ""

# 3. Blue → Info migration (for info states)
echo "🔄 Phase 3: Migrating Blue to Info (semantic)..."
replace_colors "bg-blue-50 border border-blue-200" "bg-info-100 border border-info-500" "info message pattern"
replace_colors "text-blue-600" "text-info-600" "text-blue-600 → text-info-600"
replace_colors "text-blue-700" "text-info-700" "text-blue-700 → text-info-700"
replace_colors "text-blue-800" "text-info-700" "text-blue-800 → text-info-700"
replace_colors "hover:bg-blue-50" "hover:bg-info-50" "hover:bg-blue-50 → hover:bg-info-50"
echo "✅ Blue → Info migration complete"
echo ""

# 4. Green → Success migration
echo "🔄 Phase 4: Migrating Green to Success (semantic)..."
replace_colors "bg-green-100 text-green-800" "bg-success-100 text-success-700" "success badge pattern"
replace_colors "bg-green-100" "bg-success-100" "bg-green-100 → bg-success-100"
replace_colors "text-green-600" "text-success-600" "text-green-600 → text-success-600"
replace_colors "text-green-700" "text-success-700" "text-green-700 → text-success-700"
replace_colors "text-green-800" "text-success-700" "text-green-800 → text-success-700"
replace_colors "bg-green-500" "bg-success-500" "bg-green-500 → bg-success-500"
replace_colors "bg-green-600" "bg-success-600" "bg-green-600 → bg-success-600"
replace_colors "bg-green-700" "bg-success-700" "bg-green-700 → bg-success-700"
echo "✅ Green → Success migration complete"
echo ""

# 5. Dashboard menu colors → Brand variations
echo "🔄 Phase 5: Standardizing Dashboard menu colors..."
replace_colors 'color: "bg-red-900"' 'color: "bg-brand-700"' "dashboard red-900 → brand-700"
replace_colors 'color: "bg-blue-600"' 'color: "bg-brand-600"' "dashboard blue-600 → brand-600"
replace_colors 'color: "bg-teal-600"' 'color: "bg-brand-600"' "dashboard teal-600 → brand-600"
replace_colors 'color: "bg-cyan-600"' 'color: "bg-brand-600"' "dashboard cyan-600 → brand-600"
replace_colors 'color: "bg-purple-500"' 'color: "bg-brand-600"' "dashboard purple-500 → brand-600"
replace_colors 'color: "bg-purple-600"' 'color: "bg-brand-600"' "dashboard purple-600 → brand-600"
replace_colors 'color: "bg-orange-700"' 'color: "bg-brand-700"' "dashboard orange-700 → brand-700"
replace_colors 'color: "bg-orange-500"' 'color: "bg-brand-600"' "dashboard orange-500 → brand-600"
replace_colors 'color: "bg-indigo-600"' 'color: "bg-brand-600"' "dashboard indigo-600 → brand-600"
replace_colors 'color: "bg-pink-600"' 'color: "bg-brand-600"' "dashboard pink-600 → brand-600"
replace_colors 'color: "bg-green-700"' 'color: "bg-success-700"' "dashboard green-700 → success-700"
replace_colors 'color: "bg-gray-500"' 'color: "bg-neutral-500"' "dashboard gray-500 → neutral-500"
echo "✅ Dashboard colors standardized"
echo ""

# 6. Remove slate → neutral
echo "🔄 Phase 6: Migrating Slate to Neutral..."
replace_colors "text-slate-" "text-neutral-" "text-slate-* → text-neutral-*"
replace_colors "bg-slate-" "bg-neutral-" "bg-slate-* → bg-neutral-*"
echo "✅ Slate → Neutral migration complete"
echo ""

echo "✨ Migration Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Review the changes: git diff"
echo "2. Test your application thoroughly"
echo "3. Check for any remaining old colors: grep -r 'gray-\\|slate-\\|teal-\\|cyan-\\|indigo-\\|pink-' --include='*.jsx' --include='*.tsx' ."
echo "4. Commit your changes: git add . && git commit -m 'refactor: migrate to standardized color system'"
echo ""
echo "🎨 Happy coding with your new color system!"
