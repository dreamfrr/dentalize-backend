const express = require('express');
const fs = require('fs');
const router = express.Router();
const predict = require('../controllers/predictController');
const db = require('../database/db');
const verifyTokenAndAuth  = require('../auth/verifyToken');
const { verifyUser } = require('../auth/verifyUser');
const bucket = require('../storage/storageBucket');

// Helper function to check if a file exists
function checkFileExists(filePath) {
  return fs.promises.access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

router.post('/:userId', verifyTokenAndAuth, verifyUser, async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let imgFile = req.files.input;
    let imgPath = __dirname + '/' + imgFile.name; // Updated line

    // Save the file locally first
    await imgFile.mv(imgPath);

    // Check if the image file exists right after saving
    const fileExistsAfterSave = await checkFileExists(imgPath);

    // Upload image to Google Cloud Storage in 'user-predict-image' folder
    const folderPath = `user-predict-image/${req.params.userId}`;
    const blob = bucket.file(`${folderPath}/${imgFile.name}`);
    const blobStream = blob.createWriteStream({
        resumable: false,
        gzip: true
    });

    blobStream.on('error', err => {
        console.log(err);
        res.status(500).send(err);
    });

    blobStream.on('finish', async () => {

        // The public URL can be used to directly access the file via HTTP.
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        try {
            // Check if the image file exists before prediction
            const fileExistsBeforePrediction = await checkFileExists(imgPath);

            if (!fileExistsBeforePrediction) {
                throw new Error(`File not found: ${imgPath}`);
            }

            // Continue with prediction and saving result
            const result = await predict(imgPath, req);

            // Save result with image URL
            const userId = req.params.userId;
            const docRef = db.collection('users').doc(userId);
            const predictionRef = docRef.collection('predictions').doc(result.predictionId);

            await predictionRef.set({
                ...result,
                imageUrl: publicUrl
            });

            res.send({
                ...result,
                imageUrl: publicUrl
            });
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        } finally {
            // Check if the image file exists before deleting
            const fileExistsAfterPrediction = await checkFileExists(imgPath);

            if (fileExistsAfterPrediction) {
                fs.unlinkSync(imgPath);
            }
        }
    });

    // Pipe the 'file' data into the write stream
    blobStream.end(imgFile.data);
});

router.use('*', (req, res, next) => {
    const error = new Error('Access denied - endpoint does not exist');
    error.status = 404;
    next(error);
  });
  
  // Error handling middleware
router.use((error, req, res, next) => {
    res.status(error.status || 500).json({
      message: error.message || 'An unexpected error occurred',
      status: error.status || 500
    });
  });

module.exports = router;
