import {Response, Request, NextFunction} from "express";
import CategoryService from "../service/CategoryService.js";
import {FileArray, UploadedFile} from "express-fileupload";
import {Category} from "../models/models.js";

class CategoryController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {name} = req.body as unknown as Category;
      const {image } = req.files as FileArray;
      if (!image) return res.sendStatus(400);
      const category = await CategoryService.create(name, image as UploadedFile)
      return res.json(category);
    } catch (e) {
      next(e);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAll();
      return res.json(categories);
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CategoryService.delete(+req.params.id)
      return res.status(200).json( result );
    } catch (e) {
      next(e);
    }
  }

  async change(req: Request, res: Response, next: NextFunction) {
    try {
      let uploadedImage;
      if (req.files?.image) {
        uploadedImage = req.files.image as UploadedFile;
      } else {
        uploadedImage = null;
      }
      const {id, name} = req.body as unknown as Category;
      const result = await CategoryService.change(id, name, uploadedImage);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async changeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const {data} = req.body as unknown as {data: Category[]};
      const result = await CategoryService.changeOrder(data);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }
}

export default new CategoryController();