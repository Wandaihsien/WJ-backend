import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import qs from "qs";

const router = Router();
const prisma = new PrismaClient();

const HASH_KEY = process.env.HASH_KEY;
const HASH_IV = process.env.HASH_IV;

if (!HASH_KEY || !HASH_IV) {
  throw new Error("環境變數 HASH_KEY 或 HASH_IV 沒有正確讀取！");
}
console.log("HASH_KEY:", HASH_KEY, "length:", HASH_KEY.length);
console.log("HASH_IV:", HASH_IV, "length:", HASH_IV.length);
const verifyTradeSha = (tradeInfo: string, tradeSha: string) => {
  const raw = `HashKey=${HASH_KEY}&${tradeInfo}&HashIV=${HASH_IV}`;
  const calculatedSha = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex")
    .toUpperCase();
  return calculatedSha === tradeSha;
};

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
    const { TradeInfo, TradeSha } = req.body;

    console.log("收到藍新回調:");
    console.log("TradeInfo:", TradeInfo?.substring(0, 50) + "...");
    console.log("TradeSha:", TradeSha);

    // 1. 先驗證 TradeSha
    if (!verifyTradeSha(TradeInfo, TradeSha)) {
      console.error("TradeSha 驗證失敗");
      return res.send("SUCCESS");
    }

    console.log("TradeSha 驗證成功");

    // 2. 解密 TradeInfo

    let data: any;
    data = aesDecrypt(TradeInfo);
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
    res.send("SUCCESS");
  } catch (error) {
    console.error("付款通知處理失敗", error);
    res.send("SUCCESS");
  }
});

export default router;
