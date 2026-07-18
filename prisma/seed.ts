import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.delivery.deleteMany();
  await prisma.company.deleteMany();
  await prisma.courier.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create a Company User and Company Profile
  const companyUser = await prisma.user.create({
    data: {
      email: "info@ozdenim.com",
      role: "COMPANY",
    },
  });

  const company = await prisma.company.create({
    data: {
      userId: companyUser.id,
      name: "Merter Merkez Atölye",
      defaultAddress: "Mehmet Nesih Özmen Mah., Fatih Cd. No: 24, Güngören",
      phone: "0212 555 44 33",
    },
  });

  console.log(`Created company: ${company.name}`);

  // 2. Create a Courier User and Courier Profile
  const courierUser = await prisma.user.create({
    data: {
      email: "ahmet@carryhub.com",
      role: "COURIER",
    },
  });

  const courier = await prisma.courier.create({
    data: {
      userId: courierUser.id,
      name: "Ahmet Yılmaz",
      phone: "0532 111 22 33",
      vehicleType: "Panelvan",
      isAvailable: true,
    },
  });

  console.log(`Created courier: ${courier.name}`);

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
