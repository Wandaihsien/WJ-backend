const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanup() {
  console.log("開始清理我的訂單...");

  const result = await prisma.order.deleteMany({
    where: {
      userId: "9da192f5-1683-4fdc-acec-157f0a89c233",
    },
  });

  console.log(`已刪除 ${result.count} 個我的訂單`);
  await prisma.$disconnect();
}

cleanup().catch(console.error);
