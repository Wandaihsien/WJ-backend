import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// 新增商品到購物車
router.post("/", async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || !user.userId) {
    return res.status(400).json({ error: "缺少 userId" });
  }

  const userId = user.userId;
  const { productId, quantity } = req.body;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(400).json({ error: "找不到對應的商品 ID" });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    if (!cart) {
      await prisma.cart.create({ data: { userId } });

      cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart!.id,
        productId,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart!.id,
          productId,
          quantity,
        },
      });
    }

    res.status(200).json({ message: "商品已加入購物車" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

// 刪除購物車商品
router.delete(`/:productId`, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || !user.userId) {
    return res.status(400).json({ error: "缺少 userId" });
  }
  const userId = user.userId;
  const { productId } = req.params;

  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ error: "找不到購物車" });

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: parseInt(productId),
      },
    });

    res.status(200).json({ message: "商品已從購物車移除" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

// 取得購物車內容
router.get("/", async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || !user.userId) {
    return res.status(400).json({ error: "缺少 userId" });
  }
  const userId = user.userId;

  try {
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

    if (!cart) return res.status(404).json({ error: "找不到購物車" });

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

// 更新購物車商品數量
router.patch("/", async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || !user.userId) {
    return res.status(400).json({ error: "缺少 userId" });
  }
  const userId = user.userId;
  const { productId, newQty } = req.body;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart!.id,
        productId: productId,
      },
    });
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: parseInt(newQty),
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

export default router;
