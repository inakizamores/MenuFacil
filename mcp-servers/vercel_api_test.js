
  // Script to test Vercel client directly
  require('dotenv').config({ path: '../.env' });
  const fetch = require('node-fetch');
  
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  const projectId = 'prj_Ts6nooJC1r8MYWxylC9a2fKSH1lB';
  
  async function testVercelApi() {
    try {
      console.log('Testing Vercel API with projectId:', projectId);
      
      // Test project info
      const projectResponse = await fetch(`https://api.vercel.com/v9/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!projectResponse.ok) {
        throw new Error(`HTTP error! Status: ${projectResponse.status}`);
      }
      
      const projectData = await projectResponse.json();
      console.log('Project API call successful!');
      console.log('Project Name:', projectData.name);
      
      // Test deployments
      const deploymentsResponse = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!deploymentsResponse.ok) {
        throw new Error(`HTTP error! Status: ${deploymentsResponse.status}`);
      }
      
      const deploymentsData = await deploymentsResponse.json();
      console.log('Deployments API call successful!');
      console.log('Deployment count:', deploymentsData.deployments?.length || 0);
      
      console.log('All Vercel API tests passed successfully!');
    } catch (error) {
      console.error('Error testing Vercel API:', error);
    }
  }
  
  testVercelApi();
  