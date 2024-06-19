const Firestore = require('@google-cloud/firestore');
require("dotenv").config();

const db = new Firestore({
  projectId: 'dentalize',
  keyFilename: '../backend-cc/key/serviceAccountKey.json',
});

module.exports = db;