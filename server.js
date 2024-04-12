import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();
const envUserName = process.env.MONGODB_USERNAME;
const envPassWord = process.env.MONGODB_PASSWORD;
const app = express();
const port = process.env.PORT || 5000;

mongoose
  .connect(
    `mongodb+srv://${envUserName}:${envPassWord}@mainnikedb.jx4pwkk.mongodb.net/stake`
  )
  .then(() => console.log("mongodb connected"))
  .catch((error) => {
    console.log("mongodb error: ", error);
  });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Registration Schema
const registerSchema = mongoose.Schema ({
  registerEmail: {
    type: String,
    unique: true
  },
  registerUsername: {
    type: String,
    unique: true
  },
  registerPassword: {
    type: String
  }
})

// Registration Model
const registerModel = mongoose.model("register", registerSchema);


// Registration Endpoint
app.post("/register", (req, res) => {
  res.send('<h1>Welcome!</h1>');
});


// Routes
app.get('/', (req, res) => {
    res.send('<h1>Welcome!</h1>');
});

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
