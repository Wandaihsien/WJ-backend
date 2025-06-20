import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const router = Router();
const prisma = new PrismaClient();

const generateTradeNo = () => {
  return dayjs().format("YYYYMMDDHHmmssSSS");
};
// 建立訂單
router.post("/", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) {
      return res.status(400).json({ error: "缺少userId" });
    }
    const userId = user.userId;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error("購物車不存在");
    }

    const total = cart?.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const newOrder = await prisma.order.create({
      data: {
        userId,
        total: total,
        tradeNo: generateTradeNo(),
      },
    });

    // 將時間轉成台灣時間
    const formattedOrder = {
      ...newOrder,
      date: new Date(newOrder.date).toLocaleString("zh-TW", {
        timeZone: "Asia/Taipei",
        hour12: false,
      }),
    };

    res.status(201).json(formattedOrder);
  } catch (err) {
    console.error("建立訂單失敗", err);
    res.status(500).json({ message: "建立訂單失敗" });
  }
});

// 取得所有訂單
router.get("/", async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user || !user.userId) {
    return res.status(400).json({ error: "缺少userId" });
  }
  const userId = user.userId;

  try {
    const orders = await prisma.order.findMany({
      where: { userId, status: "paid" },
      orderBy: { date: "desc" },
    });

    res.status(200).json(orders);
  } catch (err) {
    console.error("取得訂單失敗", err);
    res.status(500).json({ message: "伺服器錯誤，無法取得訂單" });
  }
});

export default router;
