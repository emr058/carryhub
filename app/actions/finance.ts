"use server";

import prisma from "@/lib/prisma";
import { serializeDelivery, serializeTransaction } from "@/lib/serializers";

export async function getWalletBalance(userId: string) {
  try {
    const credits = await prisma.transaction.aggregate({
      where: { userId, type: "CREDIT" },
      _sum: { amount: true }
    });
    
    const debits = await prisma.transaction.aggregate({
      where: { userId, type: "DEBIT" },
      _sum: { amount: true }
    });

    const creditSum = credits._sum.amount ? Number(credits._sum.amount) : 0;
    const debitSum = debits._sum.amount ? Number(debits._sum.amount) : 0;
    const balance = creditSum - debitSum;

    return { success: true, balance };
  } catch (error: any) {
    console.error("Error in getWalletBalance Server Action:", error);
    return { success: false, error: error.message, balance: 0 };
  }
}

export async function generateStatement() {
  try {
    const completedDeliveries = await prisma.delivery.findMany({
      where: { status: "DELIVERED" },
      include: {
        company: true,
        courier: true
      },
      orderBy: { updatedAt: "desc" }
    });

    const totalCommission = completedDeliveries.reduce(
      (sum, d) => sum + Number(d.commissionAmount),
      0
    );

    const totalValue = completedDeliveries.reduce(
      (sum, d) => sum + Number(d.finalPrice),
      0
    );

    const serializedDeliveries = (completedDeliveries || []).map(serializeDelivery);

    return {
      success: true,
      completedDeliveries: serializedDeliveries,
      totalCommission,
      totalValue,
      count: completedDeliveries.length
    };
  } catch (error: any) {
    console.error("Error in generateStatement Server Action:", error);
    return {
      success: false,
      error: error.message,
      completedDeliveries: [],
      totalCommission: 0,
      totalValue: 0,
      count: 0
    };
  }
}

export async function getTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        delivery: true,
        user: {
          include: {
            company: true,
            courier: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const serializedTransactions = (transactions || []).map(serializeTransaction);

    return { success: true, transactions: serializedTransactions };
  } catch (error: any) {
    console.error("Error in getTransactions Server Action:", error);
    return { success: false, error: error.message, transactions: [] };
  }
}
