import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const router = Router();
const prisma = new PrismaClient();

const HASH_KEY = process.env.HASH_KEY;
const HASH_IV = process.env.HASH_IV;

if (!HASH_KEY || !HASH_IV) {
  throw new Error("環境變數 HASH_KEY 或 HASH_IV 沒有正確讀取！");
}
console.log("HASH_KEY:", HASH_KEY, "length:", HASH_KEY.length);
console.log("HASH_IV:", HASH_IV, "length:", HASH_IV.length);

const aesDecrypt = (encryptedText: string) => {
  const key = Buffer.from(HASH_KEY, "utf8");
  const iv = Buffer.from(HASH_IV, "utf8");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  // 關閉自動填充
  decipher.setAutoPadding(false);

  let decrypted = decipher.update(encryptedText, "hex");
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  // 手動去除 PKCS7 填充
  const padding = decrypted[decrypted.length - 1];
  const result = decrypted
    .slice(0, decrypted.length - padding)
    .toString("utf8");

  // 解析 JSON
  const jsonData = JSON.parse(result);

  return jsonData;
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const tradeInfo = req.body?.TradeInfo;
    const data: any = aesDecrypt(tradeInfo);

    const { Status, Result } = data;
    if (Status === "SUCCESS") {
      await prisma.order.update({
        where: { tradeNo: Result.MerchantOrderNo },
        data: { status: "paid" },
      });
      console.log("資料庫 tradeNo:", Result.MerchantOrderNo);
      console.log("訂單狀態已更新為 paid");
      const order = await prisma.order.findUnique({
        where: { tradeNo: Result.MerchantOrderNo },
        select: { userId: true },
      });

      if (!order) {
        throw new Error("找不到訂單");
      }

      const userCart = await prisma.cart.findUnique({
        where: { userId: order.userId },
        select: { id: true },
      });

      if (userCart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
        console.log("購物車已清空:", userCart.id);
      }
    }
    res.send("SUCCESS");
  } catch (error) {
    console.error("付款通知處理失敗", error);
    res.send("SUCCESS");
  }
});

const BASE_URL = process.env.BASE_URL;
router.post("/return", (req: Request, res: Response) => {
  try {
    const tradeInfo = req.body?.TradeInfo;
    const data = aesDecrypt(tradeInfo);
    // 這裡可以更新資料庫、驗證付款等等...
    const orderNo = data.Result.MerchantOrderNo;
    res.redirect(`${BASE_URL}/checkout/success?orderNo=${orderNo}`);
  } catch (err) {
    console.error("處理失敗:", err);
    res.redirect(`${BASE_URL}/checkout/failed`);
  }
});

export default router;
