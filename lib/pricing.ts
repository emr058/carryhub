export interface CalculatedPrice {
  basePrice: number;
  coefficient: number;
  finalPrice: number;
  commissionAmount: number;
  courierPayout: number;
}

export function calculatePrice(packageType: string, dropoffAddress: string): CalculatedPrice {
  // 1. Establish base price based on route destinations
  let basePrice = 400; // Default fallback

  const addressLower = dropoffAddress.toLowerCase();
  if (addressLower.includes("güngören")) {
    basePrice = 200;
  } else if (addressLower.includes("zeytinburnu")) {
    basePrice = 300;
  } else if (addressLower.includes("ambarlı") || addressLower.includes("beylikdüzü")) {
    basePrice = 600;
  } else if (addressLower.includes("gebze")) {
    basePrice = 800;
  }

  // 2. Katsayı (coefficient) multiplier based on packageType
  let coefficient = 1.0;
  if (packageType.includes("Koli")) {
    coefficient = 1.2;
  } else if (packageType.includes("Kumaş")) {
    coefficient = 1.4;
  } else if (packageType.includes("Askılı")) {
    coefficient = 1.5;
  }

  // 3. Final calculations
  const finalPrice = Math.round(basePrice * coefficient);
  const commissionAmount = Math.round(finalPrice * 0.15); // 15% marketplace commission
  const courierPayout = finalPrice - commissionAmount;

  return {
    basePrice,
    coefficient,
    finalPrice,
    commissionAmount,
    courierPayout,
  };
}
