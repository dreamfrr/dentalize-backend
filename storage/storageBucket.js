const { Storage } = require('@google-cloud/storage');

// Initialize Google Cloud Storage
const storage = new Storage({ keyFilename: '../backend-cc/key/bucketServiceAccountKey.json' });

// Create a bucket instance
const bucket = storage.bucket('dentalize-user-assets');

module.exports = bucket;
