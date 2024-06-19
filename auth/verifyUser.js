const db = require('../database/db');

const verifyUser = async (req, res, next) => {
    try {
      // Assuming req.user holds the authenticated user's information
      if (req.params.userId === req.user.userId) { // Check if the ids match
         next();
      } else {
        res.status(403).send('Access denied.'); // Send an access denied message
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  };


  const verifyUserAndPredict = async (req, res, next) => {
    try {
      const userId = req.user.userId; // The authenticated user's ID from the verified token
      const predictionId = req.params.predictionId; // The prediction ID from the URL parameters
  
      if (!predictionId) {
        return res.status(400).send('Prediction ID is required.');
      }
  
      const docRef = db.collection('users').doc(userId);
      const predictionRef = await docRef.collection('predictions').doc(predictionId).get();
  
      if (!predictionRef.exists) {
        return res.status(404).send('Prediction not found.');
      }
  
      const predictionData = predictionRef.data();
  
      // Check if the ids match
      if (userId === req.params.userId && predictionData.predictionId === req.params.predictionId) {
        next();
      } else {
        res.status(403).send('Access denied.'); // Send an access denied message
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  

module.exports = {
  verifyUser,
  verifyUserAndPredict
 };