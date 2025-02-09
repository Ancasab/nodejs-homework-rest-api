import express from "express";
import authController from "../../controller/authController.js";
import User from "../../models/users.js";
import userSchema from "../../validators/userValidator.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const router = express.Router();

/* REGISTER - POST localhost:3000/api/users/signup */
router.post("/signup", async (req, res) => {
  try {
    // Validare request body
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // Verificare dacă utilizatorul există deja
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    // Creare utilizator
    const newUser = await authController.signup({ email, password });

    // Returnăm răspuns conform cerinței
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
    // Validare request body
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    // Verificare parolă
    const isMatching = await bcrypt.compare(password, user.password);
    if (!isMatching) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    // Creare și salvare token
    const token = jwt.sign({ data: { email: user.email } }, process.env.TOKEN_SECRET, { expiresIn: "1h" });

    await User.findByIdAndUpdate(user._id, { token });

    // Returnăm răspuns conform cerinței
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
    await User.findByIdAndUpdate(req.user._id, { token: null });

    return res.status(204).send(); 

  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


// router.get("/logout", authController.validateAuth, async (req, res) => {
//   try {
//     // Folosim direct `req.user.email` din middleware
//     const user = await User.findOneAndUpdate(
//       { email: req.user.email },
//       { token: null }
//     );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.status(200).json({ message: "Logout successful" });

//   } catch (error) {
//     console.error("Logout error:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// });


/* GET localhost:3000/api/users/current */
router.get("/current", authController.validateAuth, async (req, res) => {
  try {
    return res.status(200).json({
      email: req.user.email,
      subscription: req.user.subscription,
    });

  } catch (error) {
    console.error("Current user error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;




// import express from "express";
// import authController from "../../controller/authController.js";
// import { STATUS_CODES } from "../../utils/constants.js";
// import User from "../../models/users.js";
// import userSchema from "../../validators/userValidator.js";
// import bcrypt from 'bcrypt';


// const router = express.Router()



// /* POST localhost:3000/api/users/login/  */
// router.post("/login", async (req, res, next) => {
//   try {
//     const isValid = checkLoginPayload(req.body);
//     if (!isValid) {
//         throw new Error("the login request is invalid")
//     }
    
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({
//         status: 'error',
//         code: 401,
//         message: 'Email or password is wrong',
//         data: 'Conflict',
//       });
//     }


//     const token = await authController.login({ email, password });

//     console.dir(token);

//     res
//       .status(STATUS_CODES.success)
//       .json({ message: `Utilizatorul a fost logat cu succes`, token: token });
      
//   } catch (error) {
//     respondWithError(res, error, STATUS_CODES.error);
//   }
// });

// /* POST localhost:3000/api/users/signup/  */

// router.post("/signup", async (req, res) => {
//   try {
//     // 🔹 Validare date de intrare
//     const { error } = userSchema.validate(req.body);
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     const { email, password } = req.body;

//     // 🔹 Verificare dacă utilizatorul există deja
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ message: "Email in use" });
//     }

//     // 🔹 Hashing parolă cu bcrypt
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 🔹 Creare utilizator nou
//     const newUser = await User.create({
//       email,
//       password: hashedPassword,
//       subscription: "starter", // conform cerinței
//     });

//     // 🔹 Returnăm răspuns conform cerinței
//     return res.status(201).json({
//       user: {
//         email: newUser.email,
//         subscription: newUser.subscription,
//       },
//     });

//   } catch (error) {
//     console.error("Signup error:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // router.post("/signup", async (req, res, next) => {
// //   try {
// //       const { error } = userSchema.validate(req.body);
// //       if (error) {
// //         res.status(400).json({ message: error.details[0].message });
// //         return;
// //       }
    
// //     const { email, password } = req.body;
// //     const user = await User.findOne({ email });

// //     if (user) {
// //       return res.status(409).json({
// //         status: 'error',
// //         code: 409,
// //         message: "Email in use",
// //         data: 'Conflict',
// //       });
// //     }

// //     await authController.signup({email, password});

// //     res
// //       .status(STATUS_CODES.success)
// //       .json({ message: "Utilizatorul a fost inregistrat" })

// //   } catch (error) {
// //     respondWithError(res, error, STATUS_CODES.error);
// //   }
      
// // })

// /* GET localhost:3000/api/users/logout/  */
// router.get("/logout", authController.validateAuth, async (req, res) => {
//   try {
//     const header = req.get("authorization");

//     if (!header) {
//       return res.status(401).json({ message: "E nevoie de autentificare pentru aceasta ruta" });
//     }

//     const token = header.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ message: "Token lipsă sau invalid" });
//     }

//     const payload = await authController.getPayloadFromJWT(token);
//     console.log("Payload from JWT:", payload);

//     if (!payload?.data?.email) {
//       return res.status(401).json({ message: "Token invalid sau utilizator inexistent" });
//     }

//     const user = await User.findOneAndUpdate(
//       { email: payload.data.email }, 
//       { token: null },
//       { new: true } // Returnează user-ul actualizat
//     );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.status(200).json({ message: "Logout successful" });

//   } catch (error) {
//     console.error("Logout error:", error.message);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// });




// function checkLoginPayload(data) {
//   if (!data?.email || !data?.password) {
//     return false;
//   }
//   return true;
// }

// function checkSignupPayload(data) {
//   if (!data?.email || !data?.password) {
//     return false;
//   }
//   if (data.password.length < 8) {
//     return false;
//   }
//   return true;
// }



// export default router;


// function respondWithError(res, error,statusCode) {
//   res
//     .status(statusCode)
//     .json({ message: `${error}`});
// }
