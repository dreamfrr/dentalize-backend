const User = require('../model/user');
const bcrypt = require("bcrypt");
const db = require('../database/db');
const bucket = require('../storage/storageBucket');


const userProfile = async (req, res) => {
  try {
    const user = await User.getUserById(req.params.userId); // Get the authenticated user
    res.status(200).send(user); // Send the user in the response
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const userUpdate = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, email, password } = req.body;
    const updateData = {};

    // Check if username already exists in the database
    if (username) {
      const usernameQuerySnapshot = await db.collection('users').where('username', '==', username).get();
      if (!usernameQuerySnapshot.empty && usernameQuerySnapshot.docs[0].id !== userId) {
        return res.status(400).send({ message: 'Username already exists' });
      }
      updateData.username = username;
    }

    // Check if email already exists in the database
    if (email) {
      const emailQuerySnapshot = await db.collection('users').where('email', '==', email).get();
      if (!emailQuerySnapshot.empty && emailQuerySnapshot.docs[0].id !== userId) {
        return res.status(400).send({ message: 'Email already exists' });
      }
      updateData.email = email;
    }

    // Update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user document
    await db.collection('users').doc(userId).update(updateData);
    res.status(200).send({ message: 'User updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};


const userDelete = async (req, res) => {
  try {
    await User.deleteUserById(req.params.userId);
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const userPredictionAllHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const docRef = db.collection('users').doc(userId);
    const predictionsSnapshot = await docRef.collection('predictions').get();
    
    if (predictionsSnapshot.empty) {
      res.status(200).send('Prediction history is empty');
    } else {
      const predictions = predictionsSnapshot.docs.map(doc => doc.data());
      res.status(200).send(predictions);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};


const userPredictionHistorybyId = async (req, res) => {
  try {
    const userId = req.user.userId; // The authenticated user's ID from the verified token
    const predictionId = req.params.predictionId; // The prediction ID from the URL parameters
    const docRef = db.collection('users').doc(userId);
    const predictionDoc = await docRef.collection('predictions').doc(predictionId).get();

    if (!predictionDoc.exists) {
      return res.status(404).send('Prediction not found');
    }

    res.status(200).json(predictionDoc.data());
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const userDeletePrediction = async (req, res) => {
  try {
    const userId = req.user.userId; // The authenticated user's ID from the verified token
    const predictionId = req.params.predictionId; // The prediction ID from the URL parameters
    const docRef = db.collection('users').doc(userId);
    const predictionDocRef = docRef.collection('predictions').doc(predictionId);

    // Retrieve the prediction document to get the image URL
    const predictionDoc = await predictionDocRef.get();
    if (!predictionDoc.exists) {
      return res.status(404).send('Prediction not found or already deleted');
    }
    
    // Extract image URL from prediction document
    const imageUrl = predictionDoc.data().imageUrl;
    
    // Delete the image file from Google Cloud Storage
    const fileName = imageUrl.split('/').pop(); // Assuming imageUrl is a full path to the file
    const file = bucket.file(`user-predict-image/${userId}/${fileName}`);
    
    try {
      await file.delete();
    } catch (error) {
      if (error.code === 404) {
        return res.status(404).send('Image file not found or already deleted');
      }
      throw error; // Re-throw the error if it is not a 404
    }

    // Delete the prediction document
    await predictionDocRef.delete();
    
    res.status(200).send({ message: 'Prediction and associated image deleted successfully'});
  } catch (error) {
    res.status(400).send(error.message);
  }
};


const deleteAllUserPredictions = async (req, res) => {
  const userId = req.params.userId;
  const predictionsRef = db.collection('users').doc(userId).collection('predictions');

  try {
    const snapshot = await predictionsRef.get();

    if (snapshot.empty) {
      res.status(200).send({ message: 'No prediction history to delete, already deleted all history' });
    } else {
      const deletePromises = snapshot.docs.map(async (doc) => {
        const predictionData = doc.data();
        const predictionImageUrl = predictionData.imageUrl;
        const predictionImageFileName = predictionImageUrl.split('/').pop();
        const predictionImageFile = bucket.file(`user-predict-image/${userId}/${predictionImageFileName}`);
        
        try {
          await predictionImageFile.delete();
        } catch (error) {
          if (error.code === 404) {
            console.log(`File ${predictionImageFileName} not found or already deleted.`);
          } else {
            throw error; // If it's not a 404 error, re-throw it
          }
        }
        
        await doc.ref.delete();
      });

      await Promise.all(deletePromises);
      res.status(200).send({ message: 'All prediction history deleted successfully' });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};




const userUploadProfilePicture = async (req, res) => {
  try {
    // Check if any files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    // Access the uploaded file via 'profilePicture' key
    let profilePic = req.files.profilePicture;

    // Define the path within the bucket where the file will be stored
    const folderPath = `user-profile-picture/${req.params.userId}`;
    
    // Check if a profile picture already exists and delete it
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    if (userDoc.exists && userDoc.data().profilePictureUrl) {
      const existingFileName = userDoc.data().profilePictureUrl.split('/').pop();
      const existingFile = bucket.file(`${folderPath}/${existingFileName}`);
      await existingFile.delete();
    }

    // Create a reference to the file in the bucket for the new profile picture
    const blob = bucket.file(`${folderPath}/${profilePic.name}`);
    
    // Create a stream to write file data to Google Cloud Storage
    const blobStream = blob.createWriteStream({
      resumable: false,
      gzip: true
    });

    // Handle errors during upload
    blobStream.on('error', err => res.status(500).send(err));

    // Handle successful upload
    blobStream.on('finish', () => {
      // Construct the public URL for direct HTTP access
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      // Update user document with the new profile picture URL
      db.collection('users').doc(req.params.userId).update({
        profilePictureUrl: publicUrl
      });

      // Respond with success message and URL
      res.status(200).send({
        message: 'Profile picture uploaded successfully',
        profilePictureUrl: publicUrl
      });
    });

    // End the stream and upload the file data
    blobStream.end(profilePic.data);
  } catch (error) {
    // Handle any other errors
    res.status(500).send(error.message);
  }
};

  
module.exports = {
    userProfile,
    userUpdate,
    userDelete,
    userPredictionAllHistory,
    userPredictionHistorybyId,
    userDeletePrediction,
    userUploadProfilePicture,
    deleteAllUserPredictions
}