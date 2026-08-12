const mongoose = require('mongoose');
const dns = require('dns');

if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    if (dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder('ipv4first');
    }
  } catch (e) {}
}

const mongoUri =
  process.env.MONGO_URI ||
  'mongodb+srv://mrsarthak825_db_user:zerWK9e37LxgSKaK@cluster0.t8snekz.mongodb.net/tiffin_db?retryWrites=true&w=majority';

const wipeAll = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      if (collection.collectionName !== 'users' && collection.collectionName !== 'customers') {
        await collection.deleteMany({});
        console.log(`Cleared collection: ${collection.collectionName}`);
      }
    }

    console.log('✅ ALL TIFFINS, EXPENSES, AND PAYMENTS WIPED CLEAN!');
    process.exit(0);
  } catch (err) {
    console.error('Error wiping database:', err.message);
    process.exit(1);
  }
};

wipeAll();
