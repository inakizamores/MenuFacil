/**
 * Deployment environment verification script
 * Used to verify all required environment variables are set during CI/CD deployments
 */

async function verifyEnvironment() {
  console.log('Verifying deployment environment...');
  
  // Check for required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let missing = false;
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ Missing required environment variable: ${varName}`);
      missing = true;
    } else {
      // Never output the actual values, especially for secrets
      const isSecret = varName === 'SUPABASE_SERVICE_ROLE_KEY';
      const valuePreview = isSecret 
        ? `[Secret - ${process.env[varName].length} chars]` 
        : varName.includes('URL') 
          ? process.env[varName]
          : `[Set - ${process.env[varName].length} chars]`;
      console.log(`✅ ${varName}: ${valuePreview}`);
    }
  }
  
  if (missing) {
    console.error('❌ Environment verification failed!');
    process.exit(1);
  } else {
    console.log('✅ Environment verification complete - all required variables are set!');
  }
}

// Run the verification
verifyEnvironment().catch(err => {
  console.error('Error during environment verification:', err);
  process.exit(1);
}); 