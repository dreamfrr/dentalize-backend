const express = require('express');
const User = require('../model/user');

const { 
    userProfile,
    userUpdate,
    userDelete,
    userPredictionAllHistory,
    userDeletePrediction,
    userPredictionHistorybyId,
    userUploadProfilePicture,
    deleteAllUserPredictions
} = require('../controllers/userControllers');

const verifyTokenAndAuth  = require('../auth/verifyToken');
const {verifyUser, verifyUserAndPredict} = require('../auth/verifyUser');

const router = express.Router();

//profile
router.get('/:userId', verifyTokenAndAuth, verifyUser, userProfile);
router.put('/:userId', verifyTokenAndAuth, verifyUser, userUpdate);
router.delete('/:userId', verifyTokenAndAuth, verifyUser, userDelete);
router.post('/:userId/profile-picture', verifyTokenAndAuth, verifyUser, userUploadProfilePicture);

//prediction history
router.get('/predictions/:userId', verifyTokenAndAuth, verifyUser, userPredictionAllHistory);
router.get('/predictions/:userId/:predictionId', verifyTokenAndAuth, verifyUserAndPredict, userPredictionHistorybyId);
router.delete('/predictions/:userId/:predictionId', verifyTokenAndAuth,verifyUserAndPredict, userDeletePrediction);
router.delete('/predictions/:userId', verifyTokenAndAuth, verifyUser, deleteAllUserPredictions);

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