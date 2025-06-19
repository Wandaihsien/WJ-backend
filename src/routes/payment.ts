import { Router, Request, Response } from "express";
import crypto from "crypto";
import qs from "qs";

const router = Router();

const HASH_KEY = "asB7AyQwufOSNDyi2cVAP9Qweqws2gq6";
const HASH_IV = "C0VX917qlkej3iUP";
const MERCHANT_ID = "MS156088117";
const PAY_GATEWAY = "https://ccore.newebpay.com/MPG/mpg_gateway";

// 將交易資料進行 AES 加密（AES-256-CBC）
const aesEncrypt = (data: string) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", HASH_KEY, HASH_IV);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// 對加密資料產生 SHA256 雜湊（變成 TradeSha）
const makeTradeSha = (encryptedData: string) => {
  const raw = `HashKey=${HASH_KEY}&${encryptedData}&HashIV=${HASH_IV}`;
  return crypto.createHash("sha256").update(raw).digest("hex").toUpperCase();
};

router.post("/", async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || !user.userId) {
    return res.status(400).json({ message: "缺少userId" });
  }

  try {
    const { total, email, orderNo } = req.body;

    const tradeInfo = {
      MerchantID: MERCHANT_ID,
      RespondType: "JSON",
      TimeStamp: Date.now().toString(),
      Version: "2.0",
      MerchantOrderNo: orderNo,
      Amt: total,
      ItemDesc: "WJ 訂單",
      Email: email,
      LoginType: 0,
      ReturnURL: "https://wj-backend.onrender.com/api/notice",
      NotifyURL: "https://wj-backend.onrender.com/api/notice",
      ClientBackURL: "https://wj-frontend.onrender.com/user",
    };
    console.log("payment的 TradeInfo:", tradeInfo);

    const encrypted = aesEncrypt(qs.stringify(tradeInfo));
    const tradeSha = makeTradeSha(encrypted);

    console.log(`支付請求建立成功 - 訂單: ${orderNo}, 金額: ${total}`);

    res.json({
      MerchantID: MERCHANT_ID,
      TradeInfo: encrypted,
      TradeSha: tradeSha,
      Version: "2.0",
      PayGateWay: PAY_GATEWAY,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
  }
});

export default router;
