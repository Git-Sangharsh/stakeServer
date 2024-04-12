import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import { config as dotenvConfig } from "dotenv";

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
const registerSchema = new mongoose.Schema({
  registerEmail: {
    type: String,
    unique: true,
  },
  registerUsername: {
    type: String,
    unique: true,
  },
  registerPassword: {
    type: String,
  },
});

// Registration Model
const registerModel = mongoose.model("register", registerSchema);

// Routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome!</h1>");
});

// Registration Endpoint
app.post("/register", async (req, res) => {
  const { sendRegisterEmail, sendRegisterUsername, sendRegisterPassword } =
    req.body;
  try {
    const userEmailIsTrue = await registerModel.findOne({
      registerEmail: sendRegisterEmail,
    });
    if (userEmailIsTrue) {
      res.status(200).json({ userExist: "exit" });
    } else {
      const addRegister = await registerModel.create({
        registerEmail: sendRegisterEmail,
        registerUsername: sendRegisterUsername,
        registerPassword: sendRegisterPassword,
      });
      res.status(200).json({ registerStatus: true , info: addRegister });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error from register" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
