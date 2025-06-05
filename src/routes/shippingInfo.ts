import { Router, Response, Request } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

//獲取購物資訊
router.get('/', async(req: Request,res: Response) => {
  const user = (req as any).user
  const userId = user.userId
  if(!user || !user.userId) {
    return res.status(400).json({ error : '缺少userId'})
  }

  try {
    const shippingInfo = await prisma.shippinginfo.findUnique({
      where: { userId }
    })
    if(!shippingInfo) { 
      return res.status(404).json({ error: '找不到用戶資訊'})
    }
    res.status(200).json({shippingInfo})
  } catch(error) {
    console.error(error)
    res.status(500).json({ error:'伺服器錯誤'})
  }
})

// 新增及更新購物資訊
router.post('/', async(req: Request,res: Response)=> {
  const user = (req as any).user
  const userId = user.userId
  if(!user || !user.userId){
    return res.status(400).json({ error : '缺少userId'})
  }

  const { recipient,recipientPhone,address } = req.body

  try {
    const existingShippingInfo = await prisma.shippinginfo.findUnique({ 
      where: { userId } 
    })
    if(existingShippingInfo) {
      const updatedShippingInfo = await prisma.shippinginfo.update({
        where: { userId },
        data: {
          recipient,
          recipientPhone,
          address
        }
      })
      res.status(200).json({ updatedShippingInfo })
    } else {
      const newShippingInfo = await prisma.shippinginfo.create({
        data : {
          recipient,
          recipientPhone,
          address,
          userId
        }
      })
      res.status(201).json({ newShippingInfo })
    }
  }catch (error) {
    console.error(error)
    res.status(500).json({ error: '伺服器錯誤'})
  }
})

export default router