import {fileURLToPath} from "url";
import path from "path";
import fs from "fs-extra";
import {v4 as uuidv4} from "uuid";
import {UploadedFile} from "express-fileupload";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.resolve(path.dirname(__filename), '..');

class FsService {
    public static async CreateImage(image: UploadedFile, folderPath: string = '.') {
        let fileName = uuidv4() + ".jpg";
        await image.mv(path.resolve(__dirname, "static", folderPath, fileName));
        return fileName;
    }

    public static async ChangeImage(currentImageName: string, newImage: UploadedFile, folderPath: string = '.') {
        if (!newImage) return;

        const imagePath = path.join(__dirname, 'static', folderPath, currentImageName);
        await fs.remove(imagePath);
        let fileName = uuidv4() + ".jpg";
        await newImage.mv(path.resolve(__dirname, 'static', folderPath, fileName));
        return fileName;
    }

    public static async DeleteImage(imageName: string, folderPath: string = '.') {
        const imagePath = path.join(__dirname, '..', 'static', folderPath, imageName);
        await fs.remove(imagePath);
    }
}

export default FsService;