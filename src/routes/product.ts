import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// 取得所有商品
router.get("/", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (err) {
    console.error("取得商品失敗", err);
    res.status(500).json({ message: "伺服器錯誤，取得商品失敗" });
  }
});

export default router;
