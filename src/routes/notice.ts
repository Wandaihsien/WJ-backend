import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import qs from "qs";

const router = Router();
const prisma = new PrismaClient();

const HASH_KEY = "asB7AyQwufOSNDyi2cVAP9Qweqws2gq6";
const HASH_IV = "C0VX917qlkej3iUP";

const aesDecrypt = (encryptedText: string) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", HASH_KEY, HASH_IV);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf-8");
  return qs.parse(decrypted);
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const tradeInfo = decodeURIComponent(req.body?.TradeInfo);
    console.log("notice的 TradeInfo:", req.body?.TradeInfo);
    const data: any = aesDecrypt(tradeInfo);
    console.log("解密後的 data:", data);
    const { Status, MerchantOrderNo } = data;
    console.log("Status:", data.Status);

    if (Status === "SUCCESS") {
      await prisma.order.update({
        where: { tradeNo: MerchantOrderNo },
        data: { status: "paid" },
      });
      console.log("訂單狀態已更新為 paid");
    }
    res.send("SUCCESS");
  } catch (error) {
    console.error("付款通知處理失敗", error);
    res.sendStatus(500);
  }
});

export default router;
