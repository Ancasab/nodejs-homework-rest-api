import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/users.js';
import bcrypt from 'bcrypt';
import passport from 'passport';
import gravatar from 'gravatar';
import { v4 as uuidv4 } from 'uuid';
import { sendWithSendGrid } from '../utils/sendEmail.js';

dotenv.config();

const secretForToken = process.env.TOKEN_SECRET; 

const authController = {
    login,
    validateJWT,
    signup,
    validateAuth,
    getPayloadFromJWT,
    getUserByValidationToken,
    updateToken,
};

// LOGIN function
export async function login(data) {
    const { email, password } = data;
    const user = await User.findOne({ email: email, verify: true });

    if (!user) {
        throw new Error("Email incorrect / not validated or password is incorrect");
    }

    const isMatching = await bcrypt.compare(password, user.password);
    if (!isMatching) {
        throw new Error("Email or password is incorrect");
    }

  
    const token = jwt.sign(
        { id: user._id, email: user.email },  
        secretForToken,
        { expiresIn: "1h" }
    );

   
    await User.findByIdAndUpdate(user._id, { token });

    return token;
}

// SIGNUP function
export async function signup(data) {
    const { email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("Email already in use");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userAvatar = gravatar.url(email);  
    const token = uuidv4();

    const newUser = await User.create({
        email,
        password: hashedPassword,
        subscription: "starter",
        token: null,
        avatarURL: userAvatar,
        verificationToken: token,
        verify: false,
    });
    
    sendWithSendGrid(email, token);


    return newUser;
}

// UPDATE TOKEN FOR VALIDATION function
export async function updateToken(email, token) {
    token = token || uuidv4();
    const updatedUser = await User.findOneAndUpdate(
        { email },
        { verificationToken: token },
        { new: true } 
    );

    if (updatedUser) {
        sendWithSendGrid(email, token);
    }
}


// VALIDATION JWT  function
export function validateJWT(token) {
    try {
        const decoded = jwt.verify(token, secretForToken);
        return decoded;
    } catch (err) {
        console.error("JWT validation error:", err.message);
        return null;
    }
}

// OBTAIN PAYLOAD-ULUI FROM JWT function
export async function getPayloadFromJWT(token) {
    try {
        return jwt.verify(token, secretForToken);
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        return null;
    }
}

// Middleware for AUTHENTICATION VALIDATION function
export function validateAuth(req, res, next) {
    passport.authenticate("jwt", { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                status: "error",
                code: 401,
                message: "Not authorized",
                data: "Unauthorized"
            });
        }
        req.user = user;
        next();
    })(req, res, next);
}

// USER TOKEN VALIDATION function
export async function getUserByValidationToken(token) {
    return await User.findOne({ verificationToken: token, verify: false });
}





export default authController;




