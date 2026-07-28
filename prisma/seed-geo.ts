// Update geo coordinates for existing data
// Run: npx tsx prisma/seed-geo.ts
import { PrismaClient } from "@prisma/client";
import { addressToCoord } from "../lib/geo";

const prisma = new PrismaClient();

async function main() {
  console.log("📍 Lokasyon güncelleme başlıyor...\n");

  // Update companies
  const companies = await prisma.company.findMany();
  for (const c of companies) {
    const { lat, lng } = addressToCoord(c.defaultAddress) ?? { lat: 41.015, lng: 28.93 };
    await prisma.company.update({
      where: { id: c.id },
      data: { lat, lng },
    });
    console.log(`  🏢 ${c.name} → ${lat}, ${lng}`);
  }

  // Update couriers  
  const couriers = await prisma.courier.findMany();
  for (const c of couriers) {
    const ref = c.district || "Merter";
    const { lat, lng } = addressToCoord(ref) ?? { lat: 41.015, lng: 28.93 };
    // Add some randomness so they're not all on the same spot
    const offset = (Math.random() - 0.5) * 0.02;
    await prisma.courier.update({
      where: { id: c.id },
      data: { lat: lat + offset, lng: lng + offset },
    });
    console.log(`  🚚 ${c.name} (${c.district}) → ${lat + offset}, ${lng + offset}`);
  }

  // Update deliveries — set pickup/dropoff coords from addresses
  const deliveries = await prisma.delivery.findMany({
    where: {
      pickupLat: null,
      dropoffLat: null,
    },
  });
  for (const d of deliveries) {
    const pickupCoord = addressToCoord(d.pickupAddress);
    const dropoffCoord = addressToCoord(d.dropoffAddress);
    await prisma.delivery.update({
      where: { id: d.id },
      data: {
        pickupLat: pickupCoord?.lat ?? 41.015,
        pickupLng: pickupCoord?.lng ?? 28.93,
        dropoffLat: dropoffCoord?.lat ?? 41.015,
        dropoffLng: dropoffCoord?.lng ?? 28.93,
      },
    });
    console.log(`  📦 ${d.id.slice(0,8)} → pickup:${pickupCoord?.lat ?? 41.015},${pickupCoord?.lng ?? 28.93} dropoff:${dropoffCoord?.lat ?? 41.015},${dropoffCoord?.lng ?? 28.93}`);
  }

  console.log("\n✅ Lokasyonlar güncellendi!");
}

main()
  .catch((e) => {
    console.error("❌", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
