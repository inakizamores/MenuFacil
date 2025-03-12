#!/usr/bin/env node

/**
 * This script prepares the MenúFácil project for deployment to Vercel.
 * It performs the following tasks:
 * 1. Adds 'use client' directive to client components
 * 2. Adds dynamic export to API routes
 * 3. Creates a .env.production file from .env.local
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const SRC_DIR = path.join(process.cwd(), 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const API_DIR = path.join(SRC_DIR, 'app', 'api');
const ENV_LOCAL = path.join(process.cwd(), '.env.local');
const ENV_PRODUCTION = path.join(process.cwd(), '.env.production');

console.log('🚀 Preparing MenúFácil for Vercel deployment...');

// Function to add 'use client' directive to component files
function addUseClientDirective(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file already has 'use client' directive
  if (content.includes("'use client'") || content.includes('"use client"')) {
    return;
  }
  
  // Check if file uses React hooks
  const usesHooks = /useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef|useImperativeHandle|useLayoutEffect|useDebugValue|useDeferredValue|useTransition|useId|useSyncExternalStore|useInsertionEffect/g.test(content);
  
  if (usesHooks) {
    const newContent = "'use client';\n\n" + content;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Added 'use client' directive to ${filePath}`);
  }
}

// Function to add dynamic export to API route files
function addDynamicExport(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file already has dynamic export
  if (content.includes("export const dynamic = 'force-dynamic'")) {
    return;
  }
  
  // Add dynamic export after imports
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, '', "export const dynamic = 'force-dynamic';");
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Added dynamic export to ${filePath}`);
  }
}

// Function to create .env.production from .env.local
function createEnvProduction() {
  if (!fs.existsSync(ENV_LOCAL)) {
    console.log('⚠️ .env.local file not found. Skipping .env.production creation.');
    return;
  }
  
  const content = fs.readFileSync(ENV_LOCAL, 'utf8');
  
  // Replace localhost URLs with production URLs
  const productionContent = content
    .replace(/http:\/\/localhost:3000/g, 'https://your-production-domain.vercel.app');
  
  fs.writeFileSync(ENV_PRODUCTION, productionContent, 'utf8');
  console.log('✅ Created .env.production file');
}

// Function to recursively process directories
function processDirectory(dir, processor, fileExtensions) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath, processor, fileExtensions);
    } else if (fileExtensions.some(ext => file.endsWith(ext))) {
      processor(filePath);
    }
  }
}

// Process component files
console.log('📝 Processing component files...');
processDirectory(COMPONENTS_DIR, addUseClientDirective, ['.tsx', '.jsx']);

// Process API route files
console.log('📝 Processing API route files...');
processDirectory(API_DIR, addDynamicExport, ['.ts', '.js']);

// Create .env.production
console.log('📝 Creating .env.production...');
createEnvProduction();

// Run build to check for errors
console.log('🔨 Running build to check for errors...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful!');
} catch (error) {
  console.error('❌ Build failed. Please check the errors above.');
  console.log('⚠️ You may need to manually fix some issues before deploying.');
}

console.log('🎉 Preparation complete! Your project is now ready for Vercel deployment.');
console.log('📚 For detailed deployment instructions, see docs/vercel-deployment-guide-final.md'); 