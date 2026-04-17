// Test script to verify Samba integration
import { storageManager } from '../lib/storage.js';
import { validateSambaConfig } from '../lib/samba-config.js';

async function testSambaIntegration() {
  console.log('🧪 Testing Samba Integration...\n');

  // Test configuration
  console.log('1. Testing Samba configuration:');
  const isConfigured = validateSambaConfig();
  console.log(`   Samba configured: ${isConfigured}`);
  
  if (!isConfigured) {
    console.log('   ⚠️  Samba is not configured. Set environment variables to test full functionality.\n');
    console.log('   Required environment variables:');
    console.log('   - SAMBA_SERVER');
    console.log('   - SAMBA_SHARE');
    console.log('   - SAMBA_USERNAME');
    console.log('   - SAMBA_PASSWORD');
    console.log('   - SAMBA_DOMAIN (optional, defaults to WORKGROUP)');
    console.log('   - SAMBA_PORT (optional, defaults to 445)');
  }

  // Test available storage types
  console.log('\n2. Testing available storage types:');
  const availableTypes = storageManager.getAvailableTypes();
  console.log(`   Available storage: ${availableTypes.join(', ')}`);

  // Test local storage (always available)
  console.log('\n3. Testing local storage:');
  try {
    const testFile = Buffer.from('test file content');
    const localResult = await storageManager.upload(testFile, 'test', 'test.txt', 'local');
    console.log(`   Local upload: ${localResult.success ? '✅ Success' : '❌ Failed'}`);
    
    if (localResult.success) {
      const exists = await storageManager.exists(localResult.path!, 'local');
      console.log(`   File exists: ${exists ? '✅ Yes' : '❌ No'}`);
      
      // Clean up test file
      await storageManager.delete(localResult.path!, 'local');
      console.log('   Test file cleaned up');
    }
  } catch (error) {
    console.log(`   Local storage test failed: ${error}`);
  }

  // Test Samba storage (if configured)
  if (isConfigured) {
    console.log('\n4. Testing Samba storage:');
    try {
      const testFile = Buffer.from('test file content for samba');
      const sambaResult = await storageManager.upload(testFile, 'test', 'samba-test.txt', 'samba');
      console.log(`   Samba upload: ${sambaResult.success ? '✅ Success' : '❌ Failed'}`);
      
      if (sambaResult.success) {
        const exists = await storageManager.exists(sambaResult.path!, 'samba');
        console.log(`   File exists: ${exists ? '✅ Yes' : '❌ No'}`);
        
        // Clean up test file
        await storageManager.delete(sambaResult.path!, 'samba');
        console.log('   Samba test file cleaned up');
      }
    } catch (error) {
      console.log(`   Samba storage test failed: ${error}`);
    }
  } else {
    console.log('\n4. Skipping Samba storage test (not configured)');
  }

  console.log('\n✅ Samba integration test completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSambaIntegration().catch(console.error);
}

export { testSambaIntegration };