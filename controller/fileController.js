import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import User from "../models/users.js";

const fileController = {
    processAvatar,
};

const avatarsDir = path.join("public/avatars");

export async function processAvatar(userId, tempPath) {
  try {
    console.log("Start processing avatar");

    // Asigură-te că directorul avatars există
    await fs.mkdir(avatarsDir, { recursive: true });

    const newFilename = `${userId}-${Date.now()}.jpg`;
    const newPath = path.join(avatarsDir, newFilename);
    console.log("New path for avatar:", newPath);

    // Redimensionează și convertește imaginea în JPG folosind sharp
    await sharp(tempPath)
      .resize(250, 250) // Redimensionează la 250x250 px
      .toFormat("jpeg") // Convertim la JPEG
      .jpeg({ quality: 90 }) // Setăm calitatea imaginii
      .toFile(newPath);

    console.log("Image processed and saved to public/avatars");

    // Șterge fișierul temporar
    await fs.unlink(tempPath);
    console.log("Temporary file deleted");

    // Actualizează URL-ul avatarului în baza de date
    const avatarURL = `/avatars/${newFilename}`;
    console.log("Avatar URL:", avatarURL);

    await User.findByIdAndUpdate(userId, { avatarURL }, { new: true });
    console.log("User avatar updated");

    return avatarURL;
  } catch (error) {
    console.error("Eroare la procesarea avatarului:", error);
    throw error;  // Propagăm eroarea mai departe
  }
}

export default fileController;


// import path from "path";
// import fs from "fs/promises";
// import sharp from "sharp";
// import User from "../models/users.js";

// const avatarsDir = path.join("public/avatars");

// export async function processAvatar(req, res) {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     const userId = req.user.id;
//     const tempPath = req.file?.path;

//     if (!tempPath) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     await fs.mkdir(avatarsDir, { recursive: true });
//     const newFilename = `${userId}-${Date.now()}.jpg`;
//     const newPath = path.join(avatarsDir, newFilename);

//     // Resize and convert image using Sharp
//     await sharp(tempPath)
//       .resize(250, 250)
//       .toFormat("jpeg")
//       .toFile(newPath);

//     await fs.unlink(tempPath); // Remove temp file

//     // Update avatar URL in database
//     const avatarURL = `/avatars/${newFilename}`;
//     await User.findByIdAndUpdate(userId, { avatarURL }, { new: true });

//     res.status(200).json({ avatarURL });
//   } catch (error) {
//     console.error("Error processing avatar:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// const fileController = {
//     processAvatar,
// };

// export default fileController;




