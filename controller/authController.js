import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/users.js';
import bcrypt from 'bcrypt';
import passport from 'passport';
import gravatar from 'gravatar';

dotenv.config();

const secretForToken = process.env.TOKEN_SECRET; 

const authController = {
    login,
    validateJWT,
    signup,
    validateAuth,
    getPayloadFromJWT,
};

// Funcție de LOGIN
export async function login(data) {
    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Email or password is incorrect");
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

// Funcție de SIGNUP
export async function signup(data) {
    const { email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("Email already in use");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userAvatar = gravatar.url(email);   

    const newUser = await User.create({
        email,
        password: hashedPassword,
        subscription: "starter",
        token: null,
        avatarURL: userAvatar,
    });

    return newUser;
}

// Funcție pentru VALIDARE JWT
export function validateJWT(token) {
    try {
        const decoded = jwt.verify(token, secretForToken);
        return decoded;
    } catch (err) {
        console.error("JWT validation error:", err.message);
        return null;
    }
}

// Funcție pentru OBTINEREA PAYLOAD-ULUI din JWT
export async function getPayloadFromJWT(token) {
    try {
        return jwt.verify(token, secretForToken);
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        return null;
    }
}

// Middleware pentru VALIDAREA AUTENTIFICĂRII
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

export default authController;




