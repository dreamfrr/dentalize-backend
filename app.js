const express = require("express");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const predictRouter = require('./routes/predictRoutes');
const fileUpload = require('express-fileupload');
const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();

const app = express();
app.use(express.json());
express.urlencoded({ extended: true })

app.use(fileUpload());

async function loadModel() {
  const model = await tf.loadLayersModel(process.env.MODEL_URL);
  return model;
}

let model; // Declare the model variable
loadModel().then((loadedModel) => { // Load the model
  model = loadedModel;
  app.use((req, res, next) => {
    req.model = model;
    next();
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//routes
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use('/predict', predictRouter);


//port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

});