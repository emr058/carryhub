export interface SerializedDelivery {
  id: string;
  companyId: string;
  courierId: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  packageType: string;
  price: number;
  finalPrice: number;
  commissionAmount: number;
  status: string;
  receiverName: string | null;
  createdAt: string;
  updatedAt: string;
  company?: any;
  courier?: any;
}

export function serializeDelivery(d: any): SerializedDelivery {
  if (!d) return d;
  return {
    ...d,
    price: d.price ? Number(d.price) : 0,
    finalPrice: d.finalPrice ? Number(d.finalPrice) : 0,
    commissionAmount: d.commissionAmount ? Number(d.commissionAmount) : 0,
    createdAt: d.createdAt ? d.createdAt.toISOString() : "",
    updatedAt: d.updatedAt ? d.updatedAt.toISOString() : "",
  };
}

export function serializeTransaction(t: any) {
  if (!t) return t;
  return {
    ...t,
    amount: t.amount ? Number(t.amount) : 0,
    createdAt: t.createdAt ? t.createdAt.toISOString() : "",
    delivery: t.delivery ? serializeDelivery(t.delivery) : null
  };
}
