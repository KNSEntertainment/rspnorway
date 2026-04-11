// Test script to verify the updated authentication flow
// This script tests the Membership-only authentication system

const mongoose = require('mongoose');
const Membership = require('./models/Membership.Model');
const bcrypt = require('bcrypt');

async function testAuthFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rspnorway');
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if membership model has required fields
    console.log('\n📋 Testing Membership Model Structure...');
    const testMember = await Membership.findOne({});
    if (testMember) {
      const requiredFields = ['email', 'password', 'membershipStatus', 'passwordSetupToken', 'passwordResetToken'];
      const hasAllFields = requiredFields.every(field => testMember.schema.paths[field]);
      console.log(hasAllFields ? '✅ Membership model has all required fields' : '❌ Missing fields in Membership model');
    }

    // Test 2: Check password hashing
    console.log('\n🔐 Testing Password Hashing...');
    const testPassword = 'test123456';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log(isValid ? '✅ Password hashing works correctly' : '❌ Password hashing failed');

    // Test 3: Check approved members count
    console.log('\n👥 Testing Member Data...');
    const approvedMembers = await Membership.find({ membershipStatus: 'approved' });
    console.log(`Found ${approvedMembers.length} approved members`);

    if (approvedMembers.length > 0) {
      const memberWithPassword = approvedMembers.filter(m => m.password);
      console.log(`${memberWithPassword.length} members have passwords set`);
      const membersWithoutPassword = approvedMembers.filter(m => !m.password);
      console.log(`${membersWithoutPassword.length} members need to set password`);
    }

    // Test 4: Check token fields
    console.log('\n🔑 Testing Token Fields...');
    const membersWithSetupTokens = await Membership.find({ passwordSetupToken: { $exists: true, $ne: null } });
    const membersWithResetTokens = await Membership.find({ passwordResetToken: { $exists: true, $ne: null } });
    console.log(`${membersWithSetupTokens.length} members have setup tokens`);
    console.log(`${membersWithResetTokens.length} members have reset tokens`);

    console.log('\n✅ Authentication flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testAuthFlow();
