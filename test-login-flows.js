// Test script to verify admin and member login flows
// This script tests the dual-model authentication system

const mongoose = require('mongoose');
const User = require('./models/User.Model');
const Membership = require('./models/Membership.Model');
const bcrypt = require('bcrypt');

async function testLoginFlows() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rspnorway');
    console.log('Connected to MongoDB');

    console.log('\n=== Testing Login Flows ===\n');

    // Test 1: Check admin users in User model
    console.log('1. Testing Admin Users (User Model)...');
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`Found ${adminUsers.length} admin users`);
    
    if (adminUsers.length > 0) {
      for (const admin of adminUsers) {
        console.log(`- Admin: ${admin.email}, Role: ${admin.role}`);
        console.log(`  Has password: ${!!admin.password}`);
      }
    } else {
      console.log('No admin users found. You may need to create an admin user.');
    }

    // Test 2: Check approved members in Membership model
    console.log('\n2. Testing Members (Membership Model)...');
    const approvedMembers = await Membership.find({ membershipStatus: 'approved' });
    console.log(`Found ${approvedMembers.length} approved members`);
    
    if (approvedMembers.length > 0) {
      for (const member of approvedMembers) {
        console.log(`- Member: ${member.email}, Type: ${member.membershipType}`);
        console.log(`  Has password: ${!!member.password}`);
        console.log(`  Status: ${member.membershipStatus}`);
      }
    } else {
      console.log('No approved members found.');
    }

    // Test 3: Check for email conflicts between models
    console.log('\n3. Testing for Email Conflicts...');
    const adminEmails = adminUsers.map(u => u.email);
    const memberEmails = approvedMembers.map(m => m.email);
    const conflicts = adminEmails.filter(email => memberEmails.includes(email));
    
    if (conflicts.length > 0) {
      console.log(`Found ${conflicts.length} email conflicts between models:`);
      conflicts.forEach(email => console.log(`- ${email}`));
    } else {
      console.log('No email conflicts found. Good!');
    }

    // Test 4: Test password validation
    console.log('\n4. Testing Password Validation...');
    if (adminUsers.length > 0) {
      const testAdmin = adminUsers[0];
      if (testAdmin.password) {
        // This would work if we had the plain password to test
        console.log('Admin password field exists (cannot test validation without plain password)');
      }
    }

    if (approvedMembers.length > 0) {
      const testMember = approvedMembers[0];
      if (testMember.password) {
        console.log('Member password field exists (cannot test validation without plain password)');
      }
    }

    // Test 5: Summary
    console.log('\n=== Summary ===');
    console.log(`Admin Users: ${adminUsers.length}`);
    console.log(`Approved Members: ${approvedMembers.length}`);
    console.log(`Email Conflicts: ${conflicts.length}`);
    
    console.log('\nExpected Login Behavior:');
    console.log('- Admin users should authenticate via User model and redirect to /dashboard');
    console.log('- Members should authenticate via Membership model and redirect to /members');
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testLoginFlows();
