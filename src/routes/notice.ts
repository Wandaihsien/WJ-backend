import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import qs from "qs";

const router = Router();
const prisma = new PrismaClient();

const HASH_KEY = process.env.HASH_KEY;
const HASH_IV = process.env.HASH_IV;

const aesDecrypt = (encryptedText: string) => {
  if (!HASH_KEY || !HASH_IV) throw new Error("缺少金鑰設定");
  const key = Buffer.from(HASH_KEY, "utf8");
  const iv = Buffer.from(HASH_IV, "utf8");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return qs.parse(decrypted);
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const tradeInfo = req.body?.TradeInfo;
    console.log("notice的 TradeInfo:", tradeInfo);
    let data: any;

    try {
      data = aesDecrypt(tradeInfo);
      console.log("解密後的 data:", data);
      const { Status, Result } = data;
      if (Status === "SUCCESS") {
        await prisma.order.update({
          where: { tradeNo: Result.MerchantOrderNo },
          data: { status: "paid" },
        });
        console.log("資料庫 tradeNo:", Result.MerchantOrderNo);
        console.log("訂單狀態已更新為 paid");
      }
    } catch (error) {
      console.error("解密失敗", error);
    }
    res.send("SUCCESS");
  } catch (error) {
    console.error("付款通知處理失敗", error);
    res.send("SUCCESS");
  }
});

export default router;
