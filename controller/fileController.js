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

    
    await fs.mkdir(avatarsDir, { recursive: true });

    const newFilename = `${userId}-${Date.now()}.jpg`;
    const newPath = path.join(avatarsDir, newFilename);
    console.log("New path for avatar:", newPath);

    
    await sharp(tempPath)
      .resize(250, 250) 
      .toFormat("jpeg") 
      .jpeg({ quality: 90 }) 
      .toFile(newPath);

    console.log("Image processed and saved to public/avatars");

    
    await fs.unlink(tempPath);
    console.log("Temporary file deleted");

   
    const avatarURL = `/avatars/${newFilename}`;
    console.log("Avatar URL:", avatarURL);

    await User.findByIdAndUpdate(userId, { avatarURL }, { new: true });
    console.log("User avatar updated");

    return avatarURL;
  } catch (error) {
    console.error("Eroare la procesarea avatarului:", error);
    throw error;  
  }
}

export default fileController;







