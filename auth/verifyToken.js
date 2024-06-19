const jsonToken = require('jsonwebtoken');
const db = require('../database/db');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token;
    if (authHeader){
        jsonToken.verify(authHeader, process.env.key_JWT, (err, user) =>
    {
        if (err) res.status(403).json("Token is invalid!");
        req.user = user;
        next();
    });
    } else {
        return res.status(401).json("You are not authenticated!");
    }
};

const verifyTokenAndAuth = (req, res, next) => {
    verifyToken(req, res, async () => {
        const userSnapshot = await db.collection("users").doc(req.user.userId).get();
        if (userSnapshot.exists) {
            next();
        } else {
            res.status(403).json("You are not allowed!")
        }
    });
};


module.exports = verifyTokenAndAuth
