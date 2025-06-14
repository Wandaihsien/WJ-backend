import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// 建立訂單
router.post("/", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) {
      return res.status(400).json({ error: "缺少userId" });
    }
    const userId = user.userId;
    const { total, status } = req.body;

    const newOrder = await prisma.order.create({
      data: {
        userId,
        total,
        status,
      },
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("建立訂單失敗", err);
    res.status(500).json({ message: "建立訂單失敗" });
  }
});

// 取得所有訂單
router.get("/", async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user.userId;

  if (!user || !userId) {
    return res.status(400).json({ error: "缺少userId" });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    res.status(200).json(orders);
  } catch (err) {
    console.error("取得訂單失敗", err);
    res.status(500).json({ message: "伺服器錯誤，無法取得訂單" });
  }
});

export default router;
