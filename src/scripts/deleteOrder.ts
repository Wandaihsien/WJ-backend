const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanup() {
  console.log("開始清理我的訂單...");

  const result = await prisma.order.deleteMany({
    where: {
      userId: "5993b6d0-b6b8-4275-ba34-48fa12f5596b",
    },
  });

  console.log(`已刪除 ${result.count} 個我的訂單`);
  await prisma.$disconnect();
}

cleanup().catch(console.error);
