import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import { config as dotenvConfig } from "dotenv";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

// Load environment variables from .env file
dotenvConfig();
const envUserName = process.env.MONGODB_USERNAME;
const envPassWord = process.env.MONGODB_PASSWORD;
const env_Nodemailer_Auth = process.env.NODEMAILER_AUTH;
const env_Nodemailer_PassWord = process.env.NODEMAILER_PASSWORD;
const app = express();
const port = 5000;

mongoose
  .connect(
    `mongodb+srv://${envUserName}:${envPassWord}@mainnikedb.jx4pwkk.mongodb.net/stake`
  )
  .then(() => console.log("mongodb connected"))
  .catch((error) => {
    console.log("mongodb error: ", error);
  });

app.use(cors());
// Middleware
app.use(bodyParser.json());

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.ethereal.email",
  auth: {
    user: env_Nodemailer_Auth,
    pass: env_Nodemailer_PassWord,
  },
});

// Registration Schema
const registerSchema = new mongoose.Schema({
  registerEmail: {
    type: String,
    // unique: true,
  },
  registerUsername: {
    type: String,
    // unique: true,
  },
  registerPassword: {
    type: String,
  },
  betCounter: {
    type: Number,
  },
  betCounterWin: {
    type: Number,
  },
  betCounterLoss: {
    type: Number,
  },
  betCounterWagered: {
    type: Number
  }
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
      res.status(200).json({ registerStatus: "success", info: addRegister });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error from register" });
  }
});

app.post("/verifyemail", async (req, res) => {
  console.log("Received request body:", req.body);  // Log the incoming request body

  const { sendVerifyEmail, sendVerificationCode } = req.body;

  if (!sendVerifyEmail || !sendVerificationCode) {
    return res.status(400).json({ error: "sendVerifyEmail or sendVerificationCode is missing from the request body" });
  }

  try {
    // Send verification email using Nodemailer
    const mailOptions = {
      from: `Stake ${process.env.EMAIL_USER}`,
      to: sendVerifyEmail,
      subject: "Email Verification Stake",
      text: "Your email has been successfully verified.",
      html: `<h1>Your verification code is: ${sendVerificationCode}</h1>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Error sending verification email" });
      } else {
        console.log("Verification Email sent successfully:", info.response);
        res.status(200).json({
          success: true,
          message: "Verification email sent successfully",
        });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error from verifyemail" });
  }
});


app.post("/signin", async (req, res) => {
  const { sendSignEmail, sendSignPass } = req.body;
  try {
    const user = await registerModel.findOne({ registerEmail: sendSignEmail });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(
      sendSignPass,
      user.registerPassword
    );

    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.status(200).json({
      message: "Signin successful",
      user: user.registerUsername,
      status: true,
    });
  } catch (error) {
    console.error("Error during signin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/betcounter", async (req, res) => {
  const { userEmail, betCounter, betCounterWin, betCounterLoss, betCounterWagered } = req.body;
  try {
    const user = await registerModel.findOne({ registerEmail: userEmail });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    } else {
      user.betCounter = betCounter;
      user.betCounterWin = betCounterWin;
      user.betCounterLoss = betCounterLoss;
      user.betCounterWagered = betCounterWagered;
      await user.save();
      return res.status(200).json({
        message: "Statistics Update Successfully!!",
      });
    }
  } catch (error) {
    console.error("Error during Statistics betCounter backend:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
