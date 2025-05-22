import { Router, Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();


// 取得所有商品
router.get('/', async (req :Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (err) {
    console.log('取得商品失敗', err);
    res.status(500).json({ message:'伺服器錯誤，取得商品失敗'});
  }
})

// 新增商品
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, image, stock, description} = req.body;

    if( !name || price === undefined || !image || stock === undefined ) {
      return res.status(400).json({ message: '請填寫所有必要欄位：name, price, image, stock'})
    };

    const newProduct = await prisma.product.create({
      data: {
        name,
        image,
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