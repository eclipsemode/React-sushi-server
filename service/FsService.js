import { fileURLToPath } from "url";
import path from "path";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename), '..');
class FsService {
    static async CreateImage(image, folderPath = '.') {
        let fileName = uuidv4() + ".jpg";
        await image.mv(path.resolve(__dirname, "static", folderPath, fileName));
        return fileName;
    }
    static async ChangeImage(currentImageName, newImage, folderPath = '.') {
        if (!newImage)
            return;
        const imagePath = path.join(__dirname, 'static', folderPath, currentImageName);
        await fs.remove(imagePath);
        let fileName = uuidv4() + ".jpg";
        await newImage.mv(path.resolve(__dirname, 'static', folderPath, fileName));
        return fileName;
    }
    static async DeleteImage(imageName, folderPath = '.') {
        const imagePath = path.join(__dirname, '..', 'static', folderPath, imageName);
        await fs.remove(imagePath);
    }
}
export default FsService;
//# sourceMappingURL=FsService.js.map