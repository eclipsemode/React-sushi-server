import fileUpload, { FileArray } from 'express-fileupload';
import ProductService, {IGetProducts} from '../service/ProductService.js';
import {Response, Request, NextFunction} from "express";

class ProductController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {image } = req.files as FileArray;
      if (!image) return res.sendStatus(400);
      const product = await ProductService.create({...req.body, image})
      return res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.delete(+req.params.id)
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, sortBy, sortOrder } = req.query as unknown as IGetProducts;
      const products = await ProductService.getAll({categoryId, sortBy, sortOrder})
      return res.json(sortBy === 'rating' ? products.reverse() : products);
    } catch (e) {
      next(e);
    }
  }

  async change(req: Request, res: Response, next: NextFunction) {
    try {
      let image;
      if (req.files?.image) {
        image = req.files as FileArray
      } else {
        image = null
      }
      const product = await ProductService.change({...req.body, image});
      return res.json(product);
    } catch (e) {
      next(e);
    }
  }

  async changeOrderIndex(req: Request, res: Response, next: NextFunction) {
    try {
      const { data } = req.body;
      const result = await ProductService.changeOrderIndex(data);
      return res.json(result);
    } catch (e) {
      next(e)
    }
  }

}

export default new ProductController();