import { PrismaClient } from "@prisma/client";
import *as fs from 'fs';
import * as path from 'path';

console.log(PrismaClient)

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'mockProducts.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const products = JSON.parse(rawData);

  for (const product of products) {
    await prisma.product.create({
      data:product
    });
    console.log(`已新增商品:${product.name}`);
  }
}

main()
  .then(() => {
    console.log('所有商品已成功寫入資料庫');
  })
  .catch(() => {
    console.error('發生錯誤, err');
  })
  .finally(async () => {
    await prisma.$disconnect();
  });