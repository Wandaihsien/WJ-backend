import { Router, Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, img, stock, description} = req.body;

    if( !name || price === undefined || !img || stock === undefined ) {
      return res.status(400).json({ message: '請填寫所有必要欄位：name, price, image, stock'})
    };

    const newProduct = await prisma.product.create({
      data: {
        name,
        img,
        stock,
        price,
        description: description || null,
      }
    });

    return res.status(201).json({ message:'商品建立成功' , product: newProduct });
  } catch (err) {
    console.log('建立商品失敗', err);
    return res.status(500).json({ message: '伺服器錯誤，建立商品失敗'});
  }
});

export default router;