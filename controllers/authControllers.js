const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const userRegister = async (req, res) => {
  try {
    // Define a regular expression for validating email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if the email is in the right format
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).send({ message: 'Please enter a valid email address.' });
    }

    // Check if a user with the provided username or email already exists
    const userSnapshotByUsername = await User.get(req.body.username);
    const userSnapshotByEmail = await User.get(req.body.email);
    if (userSnapshotByUsername.exists || userSnapshotByEmail.exists) {
      return res.status(400).send({ message: 'Username or email already exists' });
    }

    // If not, create a new user
    const user = new User(req.body.username, req.body.email, req.body.password);
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send(error.message);
  }
};


const userLogin = async (req, res) => {
  try {
    const user = await User.getUserByUsername(req.body.username);
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(401).send({ message: 'Incorrect password' });
    }
    const data = {
        userId: user.userId,
        username: user.username,
        email: user.email
    }
    const token = jwt.sign( data, process.env.key_JWT, { expiresIn: "1d" });
    const {password, profilePictureUrl, ...others} = user;
    res.send({...others, token})} catch (error) {
      if (error.message === "User not found") {
        res.status(404).send({ message: 'User not found' });
      } else {
        res.status(500).send({ message: 'An error occurred' });;
}}};

const userLogout = async (req, res) => {
    res.send({ message: 'Logged out successfully' });
};

  

module.exports = {
    userRegister,
    userLogin,
    userLogout,
};