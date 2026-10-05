import { prisma } from "../db/prisma.client";
import { Payment, PaymentStatus } from "@prisma/client";

export class PaymentRepository {
  async findByOrderId(razorpayOrderId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { razorpayOrderId },
    });
  }

  async create(data: {
    registrationId: string;
    razorpayOrderId: string;
    amount: number;
    currency?: string;
    status?: PaymentStatus;
  }): Promise<Payment> {
    return prisma.payment.create({
      data: {
        registrationId: data.registrationId,
        razorpayOrderId: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency ?? "INR",
        status: data.status ?? "CREATED",
      },
    });
  }

  async sumPaid(): Promise<number> {
    const res = await prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    });
    return res._sum.amount ?? 0;
  }
}

export const paymentRepository = new PaymentRepository();
