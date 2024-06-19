const db = require("../database/db");
const bucket = require('../storage/storageBucket');
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
require('dotenv').config();


class User {
  constructor(username, email, password) {
    this.userId = nanoid(16);
    this.username = username;
    this.email = email;
    this.password = password;
  }

  static get(userId) {
    return db.collection("users").doc(userId).get();
  }

  async save() {
    try {
      if (!this.password || this.password.length === 0) {
        throw new Error("Password is required");
      }
      this.password = await bcrypt.hash(this.password, 10);
      return db.collection("users").doc(this.userId).set((JSON.parse(JSON.stringify(this))));
    } catch (error) {
      console.log(error);
    }
  }

  static async list() {
    try {
      const usersSnapshot = await db.collection("users").get();
      if (usersSnapshot.empty) {
        throw new Error("No users found");
      }
      // Map over the documents and return their data
      const users = usersSnapshot.docs.map(doc => doc.data());
      return users;
    } catch (error) {
      console.log(error);
    }
  }

  static async getUserByUsername(username) {
    try {
      const usersSnapshot = await db.collection("users").where('username', '==', username).get();
      if (usersSnapshot.empty) {
        throw new Error("User not found");
      }
      return usersSnapshot.docs[0].data(); // Assuming usernames are unique
    } catch (error) {
      console.log(error);
      throw error; 
    }
  }

  static async getUserById(userId) {
    try {
      const userSnapshot = await db.collection("users").doc(userId).get();
      if (!userSnapshot.exists) {
        console.log(userSnapshot.data());
        throw new Error("User not found");
      }
      const user = userSnapshot.data();
      const { password, ...others } = user; // Exclude password from the returned user data
      others.userId = userId; // Reassign the id here
      return others;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
  

static async updateUserbyId(userId, updateData) {
  try {
    return db.collection("users").doc(userId).update(updateData);
  } catch (error) {
    console.log(error);
  }
}
  
static async deleteUserById(userId) {
  const userRef = db.collection("users").doc(userId);
  const predictionsRef = userRef.collection("predictions");

  try {
    // Retrieve the user document to get the profile picture URL
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }
    
    // Extract profile picture URL from user document
    const userData = userDoc.data();
    const profilePictureUrl = userData.profilePictureUrl;
    
    // Check if profile picture URL exists before attempting to delete
    if (profilePictureUrl) {
      // Delete the profile picture file from Google Cloud Storage
      const profilePicFileName = profilePictureUrl.split('/').pop(); // Assuming profilePictureUrl is a full path to the file
      const profilePicFile = bucket.file(`user-profile-picture/${userId}/${profilePicFileName}`);
      
      await profilePicFile.delete();
    }

    // Retrieve all documents from the "predictions" subcollection
    const snapshot = await predictionsRef.get();
    
    // Delete each prediction image in the storage bucket and then delete the prediction document
    for (const doc of snapshot.docs) {
      const predictionData = doc.data();
      const predictionImageUrl = predictionData.imageUrl;
      
      // Check if prediction image URL exists before attempting to delete
      if (predictionImageUrl) {
        const predictionImageFileName = predictionImageUrl.split('/').pop();
        const predictionImageFile = bucket.file(`user-predict-image/${userId}/${predictionImageFileName}`);
        
        await predictionImageFile.delete();
      }
      
      await doc.ref.delete();
    }
    
    // Once all documents in the subcollection are deleted, delete the user document
    await userRef.delete();
    
  } catch (error) {
    console.log(error);
    throw error; 
  }
}



}

module.exports = User;