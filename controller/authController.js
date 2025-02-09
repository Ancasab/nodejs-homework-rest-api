import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/users.js';
import bcrypt from 'bcrypt';
import passport from 'passport';

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

    // Generăm un token JWT care conține doar `_id` și `email`, nu întregul obiect `user`
    const token = jwt.sign(
        { id: user._id, email: user.email },  
        secretForToken,
        { expiresIn: "1h" }
    );

    // Salvăm token-ul în baza de date
    await User.findByIdAndUpdate(user._id, { token });

    return token;
}

// Funcție de SIGNUP
export async function signup(data) {
    const { email, password } = data;

    // Verifică dacă email-ul există deja
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("Email already in use");
    }

    // Hash-uim parola
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Creăm utilizatorul
    const newUser = await User.create({
        email,
        password: hashedPassword,
        subscription: "starter",
        token: null
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




// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import User from '../models/users.js';
// import bcrypt from 'bcrypt';
// import passport from 'passport';


// dotenv.config();


// const authController = {
//     login,
//     validateJWT,
//     signup,
//     validateAuth,
//     getPayloadFromJWT,
// }

// const secretForToken = process.env.TOKEN_SECRET;

// export async function login(data) {
//     const { email, password } = data;
//     const user = await User.findOne({ email });

//     if (!user) {
//         throw new Error("Email is incorrect");
//     }

//     const isMatching = await bcrypt.compare(password, user.password);

//     if (!isMatching) {
//         throw new Error("Password is not matching");
//     }

//     const token = jwt.sign(
//         { data: user },
//         secretForToken,
//         { expiresIn: "1h" }
//     );

//     // Salvează token-ul în baza de date
//     await User.findOneAndUpdate(
//         { email: email }, 
//         { $set: { token: token } }, 
//         { new: true }
//     );

//     return token;
// }


// export async function signup(data) {

//     const saltRounds = 10;
//     const encryptedPassword = await bcrypt.hash(data.password, saltRounds);

//     const newUser = await User.create({
//         email: data.email,
//         password: encryptedPassword,
//         subscription: "starter",
//         token: null
//     });
//     return newUser;
// }

// export function validateJWT(token) {
//     try {
//         let isAuthenticated = false;
//         jwt.verify(token, secretForToken, (err, _decoded) => {
//             if (err) {
//                 throw new Error(err)
//             }
//             isAuthenticated = true;
//         })
//         return isAuthenticated;
//     } catch (err) {
//         console.error(err)
//     }
// }


// export async function getPayloadFromJWT(token) {
//     try {
//         const payload = jwt.verify(token, secretForToken);
//         console.log("Decoded payload:", payload); // Log payload for debugging
//         return payload;
//     } catch (err) {
//         console.error("JWT verification failed:", err.message);
//         return null;
//     }
// }





// export function validateAuth(req, res, next) {
//     passport.authenticate("jwt", { session: false }, (err, user) => {
//         console.log("User from JWT:", user);  // <-- Adaugă acest log pentru debugging
//         if (!user || err) {
//             return res.status(401).json({
//                 status: "error",
//                 code: 401,
//                 message: "Not authorized",
//                 data: "Unauthorized"
//             });
//         }
//         req.user = user;
//         next();
//     })(req, res, next);
// }






// export default authController;



