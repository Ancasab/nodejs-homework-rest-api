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
   
    await fs.mkdir(avatarsDir, { recursive: true });

    const newFilename = `${userId}-${Date.now()}.jpg`;
    const newPath = path.join(avatarsDir, newFilename);

    
    await sharp(tempPath)
      .resize(250, 250) 
      .toFormat("jpeg") 
      .jpeg({ quality: 90 }) 
      .toFile(newPath);


    
    await fs.unlink(tempPath);

   
    const avatarURL = `/avatars/${newFilename}`;

    await User.findByIdAndUpdate(userId, { avatarURL }, { new: true });

    return avatarURL;
  } catch (error) {
    console.error("Eroare la procesarea avatarului:", error);
    throw error;  
  }
}

export default fileController;







