const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb+srv://harijunkemails:1SSMbNFtQLPQuLWO@hariscluster.fydu0.mongodb.net/rspnorway')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Membership schema
const MembershipSchema = new mongoose.Schema({
  email: String,
  password: String,
  membershipStatus: String
});

const Membership = mongoose.model('Membership', MembershipSchema);

async function testMemberPassword() {
  try {
    const testEmail = 'Rajanistha77@gmail.com';
    const testPassword = 'newpassword123';
    
    // Get the member
    const member = await Membership.findOne({ email: testEmail });
    if (!member) {
      console.log('Member not found');
      process.exit(1);
    }
    
    console.log('Testing password comparison for member:', testEmail);
    console.log('Stored password hash:', member.password);
    console.log('Test password:', testPassword);
    
    // Test various passwords that might work
    const passwords = ['newpassword123', 'password123', '123456', 'test'];
    
    for (const pwd of passwords) {
      try {
        const isValid = await bcrypt.compare(pwd, member.password);
        console.log(`Password "${pwd}" valid: ${isValid}`);
      } catch (error) {
        console.log(`Password "${pwd}" compare error:`, error.message);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testMemberPassword();
