const { MongoClient } = require('mongodb');
const fs = require('fs');
const uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";
const indexedDBFile = './indexeddb.json';

async function fetchMongoDBData() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db('lab3');
        const collection = db.collection('4449'); // Assuming this is the collection

        // Fetch all data from MongoDB
        const mongoData = await collection.find({}).toArray();
        console.log('MongoDB Data:', mongoData);
        return mongoData;
    } finally {
        await client.close();
    }
}


function fetchIndexedDBData() {
    if (fs.existsSync(indexedDBFile)) {
        const indexedDBData = JSON.parse(fs.readFileSync(indexedDBFile, 'utf8'));
        console.log('IndexedDB Data:', indexedDBData);
        return indexedDBData;
    } else {
        console.log('IndexedDB data file not found.');
        return [];
    }
}

// Sync function to compare and sync data
async function syncData() {
    const mongoData = await fetchMongoDBData();
    const indexedDBData = fetchIndexedDBData();

    // Create maps for easier comparison
    const mongoMap = new Map(mongoData.map(item => [item.uuid, item]));
    const indexedDBMap = new Map(indexedDBData.map(item => [item.uuid, item]));

    const newRecords = [];
    const updatedRecords = [];

    // Sync data from IndexedDB to MongoDB
    indexedDBData.forEach(item => {
        if (!mongoMap.has(item.uuid)) {
            newRecords.push(item); // New records to insert in MongoDB
        } else if (JSON.stringify(mongoMap.get(item.uuid)) !== JSON.stringify(item)) {
            updatedRecords.push(item); // Records that need to be updated
        }
    });

    if (newRecords.length || updatedRecords.length) {
        console.log(`New records to sync: ${newRecords.length}`);
        console.log(`Records to update: ${updatedRecords.length}`);
    } else {
        console.log('IndexedDB and MongoDB are already in sync.');
    }
}

// Run sync
syncData().catch(console.error);
