// Safe demo data inserter — doesn't delete existing users
// Run: npx tsx prisma/seed-demo.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📦 Adding demo deliveries & transactions...");

  // Find existing companies and couriers
  const companies = await prisma.company.findMany();
  const couriers = await prisma.courier.findMany();

  if (companies.length === 0) {
    console.log("❌ No companies found. Run prisma db seed first or create a company.");
    return;
  }
  if (couriers.length === 0) {
    console.log("❌ No couriers found. Run prisma db seed first or create a courier.");
    return;
  }

  const company1 = companies[0];
  const company2 = companies.length > 1 ? companies[1] : companies[0];
  const courier1 = couriers[0];
  const courier2 = couriers.length > 1 ? couriers[1] : couriers[0];
  const courier3 = couriers.length > 2 ? couriers[2] : couriers[0];

  // Sample delivery data
  const deliveries = [
    {
      companyId: company1.id,
      courierId: courier3.id,
      pickupAddress: "Mehmet Nesih Özmen Mah., Fatih Cd. No:24, Güngören",
      dropoffAddress: "Giyimkent, Esenler",
      packageType: "36 koli yıkamalı denim pantolon",
      price: 2680,
      finalPrice: 2680,
      commissionAmount: 402,
      status: "IN_TRANSIT" as const,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      companyId: company2.id,
      pickupAddress: "15 Temmuz Mah., Bağcılar",
      dropoffAddress: "Ambarlı Limanı",
      packageType: "18 rulo döşemelik dokuma kumaş",
      price: 3860,
      finalPrice: 3860,
      commissionAmount: 579,
      status: "PENDING" as const,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    {
      companyId: company1.id,
      courierId: courier1.id,
      pickupAddress: "Keresteciler Sitesi, Merter",
      dropoffAddress: "Çırpıcı, Zeytinburnu",
      packageType: "12 koli düğme, fermuar ve tela",
      price: 1340,
      finalPrice: 1340,
      commissionAmount: 201,
      status: "ASSIGNED" as const,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      companyId: company2.id,
      courierId: courier2.id,
      pickupAddress: "Davutpaşa, Zeytinburnu",
      dropoffAddress: "THY Kargo, İGA",
      packageType: "48 koli askılı ihracat konfeksiyonu",
      price: 5240,
      finalPrice: 5240,
      commissionAmount: 838.4,
      status: "DELIVERED" as const,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      companyId: company1.id,
      courierId: courier1.id,
      pickupAddress: "Sanayi Mah., Güngören",
      dropoffAddress: "Yenibosna Kargo Merkezi",
      packageType: "22 çuval penye ve ribana kumaş",
      price: 2320,
      finalPrice: 2320,
      commissionAmount: 348,
      status: "DELIVERED" as const,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      companyId: company1.id,
      courierId: courier2.id,
      pickupAddress: "Mahmutbey, Bağcılar",
      dropoffAddress: "Tekstilkent, Esenler",
      packageType: "64 askılı abiye elbise",
      price: 2760,
      finalPrice: 2760,
      commissionAmount: 414,
      status: "ASSIGNED" as const,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    },
    {
      companyId: company2.id,
      courierId: null,
      pickupAddress: "Tozkoparan, Güngören",
      dropoffAddress: "Yenidoğan, Bayrampaşa",
      packageType: "20 koli dokuma etiket ve lastik",
      price: 1780,
      finalPrice: 1780,
      commissionAmount: 267,
      status: "PENDING" as const,
      createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    },
  ];

  let createdCount = 0;
  for (const d of deliveries) {
    // Check if similar delivery exists (by same company, similar package, recent time)
    const existing = await prisma.delivery.findFirst({
      where: {
        companyId: d.companyId,
        packageType: d.packageType,
        createdAt: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      },
    });
    if (!existing) {
      await prisma.delivery.create({ data: d });
      createdCount++;
    }
  }
  console.log(`✅ Created ${createdCount} new deliveries`);

  // Create transactions for DELIVERED deliveries
  const deliveredDeliveries = await prisma.delivery.findMany({
    where: { status: "DELIVERED" },
    include: { company: { include: { user: true } }, courier: { include: { user: true } } },
  });

  let txCount = 0;
  for (const d of deliveredDeliveries) {
    const existingTx = await prisma.transaction.findFirst({
      where: { deliveryId: d.id },
    });
    if (!existingTx) {
      // Company debit
      await prisma.transaction.create({
        data: {
          amount: Number(d.finalPrice),
          type: "DEBIT",
          status: "COMPLETED",
          deliveryId: d.id,
          userId: d.company.userId,
        },
      });
      txCount++;

      // Courier credit
      const courierAmount = Number(d.finalPrice) - Number(d.commissionAmount);
      if (d.courier?.userId) {
        await prisma.transaction.create({
          data: {
            amount: courierAmount,
            type: "CREDIT",
            status: "COMPLETED",
            deliveryId: d.id,
            userId: d.courier.userId,
          },
        });
        txCount++;
      }

      // Platform commission
      await prisma.transaction.create({
        data: {
          amount: Number(d.commissionAmount),
          type: "CREDIT",
          status: "COMPLETED",
          deliveryId: d.id,
          userId: null,
        },
      });
      txCount++;
    }
  }
  console.log(`✅ Created ${txCount} new transactions`);

  // Stats summary
  const stats = await prisma.delivery.groupBy({
    by: ["status"],
    _count: true,
  });
  console.log("\n📊 Delivery Stats:");
  for (const s of stats) {
    console.log(`  ${s.status}: ${s._count}`);
  }

  const totalVolume = await prisma.delivery.aggregate({
    _sum: { finalPrice: true },
  });
  console.log(`\n💰 Total Volume: ₺${Number(totalVolume._sum.finalPrice || 0).toLocaleString("tr-TR")}`);

  console.log("\n✅ Demo data seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
