# Color System Quick Reference 🎨

## Brand (Primary)
```jsx
bg-brand          // #0094da - Main actions
bg-brand-600      // Hover states
bg-brand-700      // Active/pressed
text-brand        // Links, accents
border-brand      // Focus, active borders
```

## Neutral (Text & Backgrounds)
```jsx
bg-neutral-50     // Page background
bg-neutral-100    // Card/subtle background
text-neutral-700  // Primary text
text-neutral-500  // Muted text
text-neutral-900  // Headings
border-neutral-200 // Default borders
```

## Semantic Colors

### Success ✅
```jsx
bg-success-100 text-success-700    // Success message
bg-success-600 hover:bg-success-700 // Success button
```

### Error ❌
```jsx
bg-error-100 text-error-700        // Error message
bg-error-600 hover:bg-error-700    // Delete/danger button
text-error-600                     // Error text/icons
```

### Warning ⚠️
```jsx
bg-warning-100 text-warning-700    // Warning message
text-warning-600                   // Warning text
```

### Info ℹ️
```jsx
bg-info-100 text-info-700          // Info message
text-info-600 hover:bg-info-50     // Edit button
```

## Common Patterns

### Buttons
```jsx
// Primary
className="bg-brand hover:bg-brand-600 text-white"

// Secondary
className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700"

// Danger
className="bg-error-600 hover:bg-error-700 text-white"

// Outline
className="border border-neutral-300 hover:bg-neutral-50"
```

### Forms
```jsx
// Input
className="border-neutral-300 focus:ring-brand focus:border-brand"

// Focus state
className="focus:outline-none focus:ring-2 focus:ring-brand"

// Error state
className="border-error-500 focus:ring-error-500"

// Disabled
className="bg-neutral-100 text-neutral-400"
```

### Cards
```jsx
className="bg-white border border-neutral-200 shadow"
className="hover:shadow-lg hover:border-brand"
```

### Navigation
```jsx
// Active link
className="bg-brand text-white"

// Inactive link
className="text-neutral-700 hover:text-brand hover:bg-neutral-50"
```

### Messages
```jsx
// Success
<div className="bg-success-100 border border-success-500 text-success-700 rounded p-4">

// Error
<div className="bg-error-100 border border-error-500 text-error-700 rounded p-4">

// Info
<div className="bg-info-100 border border-info-500 text-info-700 rounded p-4">

// Warning
<div className="bg-warning-100 border border-warning-500 text-warning-700 rounded p-4">
```

### Gradients
```jsx
// Brand gradient
className="bg-gradient-to-r from-brand-600 to-brand-400"

// Subtle background
className="bg-gradient-to-b from-neutral-50 to-white"

// Hero overlay
className="bg-gradient-to-r from-neutral-900/90 to-neutral-900/40"
```

## Migration Quick Map

| Old | New |
|-----|-----|
| `gray-*` | `neutral-*` |
| `slate-*` | `neutral-*` |
| `red-100` | `error-100` |
| `red-600` | `error-600` |
| `blue-600` | `info-600` |
| `green-600` | `success-600` |
| `orange-600` | `warning-600` |
| All accent colors | `brand-*` variants |

## Don't Use ❌

- ~~`gray-*`~~ → Use `neutral-*`
- ~~`blue-*` for errors~~ → Use `error-*`
- ~~`purple-*, indigo-*, teal-*, cyan-*, pink-*`~~ → Use `brand-*`
- ~~`bg-brand/10`~~ → Use `bg-brand-50`
- ~~Complex multi-color gradients~~ → Use brand gradients

## Remember 💡

✅ **Use semantic colors for meaning**
- Success = Green
- Error = Red
- Warning = Amber
- Info = Blue

✅ **Use brand for actions & identity**
- Buttons, links, active states

✅ **Use neutral for structure**
- Text, backgrounds, borders

✅ **Keep it simple**
- 4 color families: brand, neutral, semantic
- Defined shades only
- No random opacity values
