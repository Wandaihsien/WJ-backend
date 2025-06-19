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
    console.log("收到藍新通知", req.body);
    const tradeInfo = req.body?.TradeInfo;
    console.log("收到的 TradeInfo:", req.body?.TradeInfo);
    const data: any = aesDecrypt(tradeInfo);
    const { Status, MerchantOrderNo } = data;

    if (Status === "SUCCESS") {
      await prisma.order.update({
        where: { tradeNo: MerchantOrderNo },
        data: { status: "paid" },
      });
    }
    res.send("SUCCESS");
  } catch (error) {
    console.error("付款通知處理失敗", error);
    res.sendStatus(500);
  }
});

export default router;
