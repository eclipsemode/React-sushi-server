import { Router } from "express";
const router = Router();
import userRouter from './userRouter.js';
import productRouter from './productRouter.js';
import categoryRouter from './categoryRouter.js';
import orderRouter from './orderRouter.js';
import promoCodeRouter from './promoCodeRouter.js';
import branchRouter from './branchRouter.js';
router.use('/user', userRouter);
router.use('/product', productRouter);
router.use('/categories', categoryRouter);
router.use('/order', orderRouter);
router.use('/promocode', promoCodeRouter);
router.use('/branch', branchRouter);
router.use('/', (req, res, next) => res.send('Hello'));
export default router;
//# sourceMappingURL=index.js.map