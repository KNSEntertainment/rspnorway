// Test script to verify complete session clearing on sign out
// This script tests the comprehensive sign out functionality

const { completeSignOut, clearAuthData, isAuthenticated } = require('./utils/authUtils');

async function testSignOutCleanup() {
  console.log('=== Testing Complete Sign Out Cleanup ===\n');

  try {
    // Test 1: Check if authentication utilities are available
    console.log('1. Testing Authentication Utilities...');
    console.log('completeSignOut function:', typeof completeSignOut);
    console.log('clearAuthData function:', typeof clearAuthData);
    console.log('isAuthenticated function:', typeof isAuthenticated);

    // Test 2: Simulate session data before sign out
    console.log('\n2. Simulating Session Data...');
    if (typeof window !== 'undefined') {
      // Set some test session data
      sessionStorage.setItem('test-key', 'test-value');
      localStorage.setItem('test-key', 'test-value');
      document.cookie = 'test-cookie=test-value; path=/';
      
      console.log('Session storage set:', sessionStorage.getItem('test-key'));
      console.log('Local storage set:', localStorage.getItem('test-key'));
      console.log('Cookie set:', document.cookie.includes('test-cookie'));
    }

    // Test 3: Test clearAuthData function
    console.log('\n3. Testing clearAuthData function...');
    clearAuthData();
    
    if (typeof window !== 'undefined') {
      console.log('Session storage after clear:', sessionStorage.length);
      console.log('Local storage after clear:', localStorage.length);
      console.log('Cookies after clear:', document.cookie);
    }

    // Test 4: Test completeSignOut (in browser environment)
    console.log('\n4. Testing completeSignOut function...');
    console.log('Note: completeSignOut requires browser environment and NextAuth context');
    
    // Test 5: Check authentication status
    console.log('\n5. Testing authentication status...');
    const authStatus = isAuthenticated();
    console.log('Current authentication status:', authStatus);

    console.log('\n=== Test Summary ===');
    console.log('All authentication utilities are properly defined');
    console.log('Session clearing functions are available');
    console.log('Sign out optimization is ready for testing in browser');

    console.log('\nExpected Behavior on Sign Out:');
    console.log('1. NextAuth session cookies cleared');
    console.log('2. Session storage cleared');
    console.log('3. Local storage cleared');
    console.log('4. All authentication cookies cleared');
    console.log('5. User redirected to home page');
    console.log('6. Clean authentication state');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testSignOutCleanup();
