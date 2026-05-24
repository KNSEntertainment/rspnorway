#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

// Analyze bundle sizes and provide optimization recommendations
function analyzeBundle() {
  const buildDir = path.join(process.cwd(), '.next/static/chunks');
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ Build directory not found. Run `npm run build` first.');
    return;
  }

  console.log('🔍 Analyzing bundle sizes...\n');

  const chunks = fs.readdirSync(buildDir)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(buildDir, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath);
      const gzipped = gzipSync(content);
      
      return {
        name: file,
        size: stats.size,
        gzipped: gzipped.length,
        path: filePath
      };
    })
    .sort((a, b) => b.size - a.size);

  // Display largest chunks
  console.log('📊 Largest chunks (uncompressed):');
  chunks.slice(0, 10).forEach((chunk, index) => {
    const sizeMB = (chunk.size / 1024 / 1024).toFixed(2);
    const gzippedMB = (chunk.gzipped / 1024 / 1024).toFixed(2);
    console.log(`${index + 1}. ${chunk.name}: ${sizeMB} MB (${gzippedMB} MB gzipped)`);
  });

  // Calculate total bundle size
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const totalGzipped = chunks.reduce((sum, chunk) => sum + chunk.gzipped, 0);
  
  console.log('\n📈 Total bundle size:');
  console.log(`Uncompressed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Gzipped: ${(totalGzipped / 1024 / 1024).toFixed(2)} MB`);

  // Provide optimization recommendations
  console.log('\n💡 Optimization Recommendations:');
  
  if (totalSize > 5 * 1024 * 1024) {
    console.log('⚠️  Bundle size is large. Consider:');
    console.log('   - More aggressive code splitting');
    console.log('   - Dynamic imports for heavy components');
    console.log('   - Tree shaking unused dependencies');
  }

  // Check for specific large chunks
  const vendorChunk = chunks.find(chunk => chunk.name.includes('vendor'));
  if (vendorChunk && vendorChunk.size > 2 * 1024 * 1024) {
    console.log('🎯 Vendor chunk is large. Consider splitting specific libraries.');
  }

  const framerChunk = chunks.find(chunk => chunk.name.includes('framer'));
  if (framerChunk && framerChunk.size > 500 * 1024) {
    console.log('🎯 Framer Motion chunk is large. Consider dynamic imports.');
  }

  const tiptapChunk = chunks.find(chunk => chunk.name.includes('tiptap'));
  if (tiptapChunk && tiptapChunk.size > 500 * 1024) {
    console.log('🎯 TipTap chunk is large. Consider dynamic imports.');
  }

  console.log('\n✅ Bundle analysis complete!');
}

// Check package.json for optimization opportunities
function analyzeDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('\n📦 Dependency Analysis:');
  
  // Check for heavy dependencies
  const heavyDeps = [
    'framer-motion',
    '@tiptap',
    'yet-another-react-lightbox',
    'react-player',
    'mongoose',
    'stripe'
  ];

  heavyDeps.forEach(dep => {
    const version = Object.keys(packageJson.dependencies).find(key => key.includes(dep));
    if (version) {
      console.log(`🔍 ${version}: Consider dynamic imports or lighter alternatives`);
    }
  });

  // Check for duplicate functionality
  const duplicateChecks = [
    { deps: ['bcrypt', 'bcryptjs'], message: 'Both bcrypt and bcryptjs found - consider using one' },
    { deps: ['react-hot-toast', '@radix-ui/react-toast'], message: 'Multiple toast libraries found' }
  ];

  duplicateChecks.forEach(check => {
    const found = check.deps.filter(dep => packageJson.dependencies[dep]);
    if (found.length > 1) {
      console.log(`⚠️  ${check.message}`);
    }
  });
}

// Main execution
if (require.main === module) {
  analyzeBundle();
  analyzeDependencies();
}

module.exports = { analyzeBundle, analyzeDependencies };
