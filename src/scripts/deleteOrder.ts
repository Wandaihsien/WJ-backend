const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanup() {
  console.log("開始清理我的訂單...");

  const result = await prisma.order.deleteMany({
    where: {
      userId: "157cb968-b516-4c87-a315-c809b2f01b56",
    },
  });

  console.log(`已刪除 ${result.count} 個我的訂單`);
  await prisma.$disconnect();
}

cleanup().catch(console.error);
