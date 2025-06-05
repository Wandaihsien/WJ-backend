import { Router,Response,Request } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient

// 獲得會員資料
router.get('/', async(req:Request,res:Response)=> {
  const user = (req as any).user
  if(!user || !user.userId) {
    return res.status(400).json({ error: '未提供userId' })
  }
  const userId = user.userId

  try {
    const userData = await prisma.user.findUnique({ 
      where: { id: userId }
    })
    if(!userData){
      return res.status(404).json({ error: '找不到會員資訊' })
    }
    res.status(200).json({userData})
  }catch(error) {
    console.error(error)
    res.status(500).json({ error:'伺服器錯誤'})
  }
})


// 更新會員資料
router.put('/', async(req:Request, res:Response) => {
  const user = (req as any).user
  if(!user || !user.userId) {
    return res.status(400).json({ error: '未提供userId' })
  }

  const userId = user.userId
  const { name, phone } = req.body

  try {
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phone
        }
      })
      res.status(200).json({ updatedUser })
  }catch(error) {
    console.error(error)
    res.status(500).json({ error: '伺服器錯誤'})
  }
})
export default router