import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();


// 建立訂單
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, total,status } = req.body;

    if(!userId || !total || !status) {
      return res.status(400).json({message:'缺少必要欄位'})
    }

    const newOrder = await prisma.order.create({
      data: {
        userId,
        total,
        status,
      },
    });

    res.status(201).json(newOrder);
  } catch(err) {
    console.error('建立訂單失敗', err);
    res.status(500).json({ message: '建立訂單失敗' });
  }
  
});


// 取得所有訂單
router.get('/user/:userId', async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if(Number.isNaN(userId)) {
    return res.status(400).json({ message : 'userId 必須是數字' });
  }
  try {
    const orders = await prisma.order.findmany({
      where: { userId},
      orderBy: { date: 'desc'}
    })

    res.status(200).json(orders);
  } catch(err) {
    console.error('取得訂單失敗', err);
    res.status(500).json({ message: '伺服器錯誤，無法取得訂單' });
  }
})

export default router;