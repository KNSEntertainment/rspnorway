// Migration script to add position field to existing executive members
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

async function addPositionToExecutiveMembers() {
  try {
    console.log('Starting migration: Adding position field to existing executive members...');
    
    // Use the same MongoDB connection as the application
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rspnorway';
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // Extract database name from URI or use default
    const dbName = MONGODB_URI.split('/').pop().split('?')[0] || 'rspnorway';
    const db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
    const collection = db.collection('memberships');
    
    // Find all existing executive members
    const existingExecutiveMembers = await collection.find({ 
      membershipType: 'executive' 
    }).toArray();
    
    console.log(`Found ${existingExecutiveMembers.length} existing executive members`);
    
    // Update each executive member with a default position
    const updateOperations = existingExecutiveMembers.map(member => ({
      updateOne: {
        filter: { _id: member._id },
        update: { 
          $set: { 
            position: member.position || 'Executive Member' // Default position if not already set
          }
        }
      }
    }));
    
    // Execute bulk update
    if (updateOperations.length > 0) {
      const result = await collection.bulkWrite(updateOperations);
      console.log(`Successfully updated ${result.modifiedCount} executive members with position field`);
      
      // Log some examples of updated documents
      const sampleUpdated = await collection.find({ membershipType: 'executive' }).limit(3).toArray();
      console.log('Sample updated executive members:', JSON.stringify(sampleUpdated.map(m => ({
        _id: m._id,
        fullName: m.fullName,
        membershipType: m.membershipType,
        position: m.position
      })), null, 2));
    } else {
      console.log('No executive members found to update');
    }
    
    console.log('Migration completed successfully!');
    
    await client.close();
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run the migration
addPositionToExecutiveMembers();
