import express from "express";
import authController from "../../controller/authController.js";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import User from "../../models/users.js";
import userSchema from "../../validators/userValidator.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import fileController from "../../controller/fileController.js";
import emailSchema from "../../validators/emailValidator.js";



dotenv.config();

const router = express.Router();

/* REGISTER - POST localhost:3000/api/users/signup */
router.post("/signup", async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const newUser = await authController.signup({ email, password });

    return res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/* LOGIN - POST localhost:3000/api/users/login */
router.post("/login", async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const isMatching = await bcrypt.compare(password, user.password);
    if (!isMatching) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ data: { email: user.email } }, process.env.TOKEN_SECRET, { expiresIn: "1h" });

    await User.findByIdAndUpdate(user._id, { token });

    return res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
        
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/* LOGOUT - GET localhost:3000/api/users/logout */
router.get("/logout", authController.validateAuth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { token: null }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Logout successful" });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


/* GET localhost:3000/api/users/current */
router.get("/current", authController.validateAuth, async (req, res) => {
  try {
    return res.status(200).json({
      email: req.user.email,
      subscription: req.user.subscription,
      avatarURL: req.user.avatarURL,
    });

  } catch (error) {
    console.error("Current user error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/* GET localhost:3000/api/users/verify/:verificationToken */
router.get("/verify/:verificationToken", async (req, res) => {
  const token = req.params.verificationToken;

  try {
    const user = await authController.getUserByValidationToken(token);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findOneAndUpdate(
      { verificationToken: token },
      { verify: true, verificationToken: null },
      { new: true }
    );

    return res.status(200).json({ message: "Verification successful" });

  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


/* POST localhost:3000/api/users/verify */
router.post("/verify", async (req, res) => {
  const { error } = emailSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Missing required field email" });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res.status(400).json({ message: "Verification has already been passed" });
    }

    const newToken = user.verificationToken || uuidv4();
    await authController.updateToken(email, newToken);

    return res.status(200).json({ message: "Verification email sent" });

  } catch (error) {
    console.error("Error resending verification email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


/* Renew/ update subscription 
PATCH localhost:3000/api/users */
router.patch("/", authController.validateAuth, async (req, res) => {
  try {
    const { subscription } = req.body;
    const validSubscriptions = ["starter", "pro", "business"];

    if (!validSubscriptions.includes(subscription)) {
      return res.status(400).json({ message: "Invalid subscription type" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { subscription },
      { new: true }
    );

    res.status(200).json({
      email: updatedUser.email,
      subscription: updatedUser.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* AVATAR UPDATE 
PATCH localhost:3000/api/users/avatars */
const uploadDir = path.join("tmp");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.patch("/avatars", authController.validateAuth, upload.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarURL = await fileController.processAvatar(req.user._id, req.file.path);
    res.json({ avatarURL });
  } catch (error) {
    next(error);
  }
});


export default router;


