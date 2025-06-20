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

const aesDecrypt = (encryptedText: string) => {
  const HASH_KEY = "wbjRkzm8XPpSF339I5uMJhOTkpsL4CEk";
  const HASH_IV = "CMakBriK5LGg3SzP";

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

const tradeInfo =
  "f3e24ea668bba6e3a94d57652d848b4cca6a213453640abf4a7c7e5b8b48e7536fcd699d058c41c8392b08ebb7fd3742ad589c638b81a1fbe371fd25b592e9817192c3de4e5706ec707f23471b6022c285ae41f2eff8de5d63e1cc58c552461e096d09fa2ddfd8a95a2dd25f02d40d7aab86811e519820aaab54f439b4ae7d59ad7f10e27264c3e30154e22620f21ccd547ea54a8be26a59e68659e8201e3580825c75ba883abe216a97c0718f2378631adb31427970eecd156611267e4e9bdb3c75b7b85d4c3209a80d50194ff70e21d66378b7b6c8215872655914ee8508bc51fcd24e00bfb59cb2ccfc9a6fc44f2122e8a827c962b80b9d9af1b7e6a22879023d114b99cb3627bce162aac185ce04d5ae6c0f072f20bbeba1fc28c4384fba21ee51437f2ef10f31b53be77efd680c3cb8308742a5efe382044d421865ba123ee517d8c6c0d8c1631922798a12839aa57cbf9650c542722e8673be2348a2ca0e7708359bdb99bf3b16352e647d3e25df6c33d3877eef42ea309d5b4e0831b61fd81eff9e79965881002d2042cee867c6d10b24477f3baa081f5d5fcb13f252ad85d2808da64261ecae599190bc2fcbd89adbc19edd8935f1babd07eb56a9318cf1091d97bb123fa7e80c8c4cd99acf9424121b1fab2565faa66c12197658ba2acd30740f561123f359b8a4d5f75ae1745ab7e8fc59618ad815eed60ea85c2b";
console.log(aesDecrypt(tradeInfo));

router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("收到藍新回調:,");
    console.log("HASH_KEY exists:", !!HASH_KEY);
    console.log("HASH_IV exists:", !!HASH_IV);

    const tradeInfo = req.body?.TradeInfo;
    console.log(tradeInfo);
    const data: any = aesDecrypt(tradeInfo);
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
