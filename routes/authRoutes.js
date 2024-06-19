const express = require('express');
const { 
    userRegister,    
    userLogin,
    userLogout,
 } 
    = require('../controllers/authControllers');

const router = express.Router();

router.post('/register', userRegister);
router.post('/login', userLogin);
router.post('/logout', userLogout);

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


module.exports = router
