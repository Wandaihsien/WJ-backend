import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const rawData = fs.readFileSync("src/scripts/mockProducts.json", "utf-8");
  const products = JSON.parse(rawData);

  await prisma.product.deleteMany();

  await prisma.$executeRawUnsafe(`ALTER TABLE product AUTO_INCREMENT = 1`);

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
    console.log(`已新增商品:${product.name}`);
  }
}

main()
  .then(() => {
    console.log("所有商品已成功寫入資料庫");
  })
  .catch((error) => {
    console.error("發生錯誤", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
