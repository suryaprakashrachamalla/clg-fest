import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/payment.service";
import { verifyPaymentSchema, paymentFailureSchema } from "../validators/registration.validator";
import { verifyWebhookSignature } from "../integrations/razorpay.client";
import { sendSuccess, sendError } from "../utils/response.util";
import { AuthenticatedRequest } from "../types";

export class PaymentController {
  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const input = verifyPaymentSchema.parse(req.body);
      const result = await paymentService.verifyAndConfirm({
        orderId: input.razorpay_order_id,
        paymentId: input.razorpay_payment_id,
        signature: input.razorpay_signature,
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async paymentFailure(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = paymentFailureSchema.parse(req.body);
      const regId = await paymentService.recordPaymentFailure({
        orderId: input.razorpay_order_id,
        kind: input.kind,
        reason: input.reason,
        userId: req.user?.id,
      });
      return sendSuccess(res, { recorded: true, registrationId: regId });
    } catch (err) {
      next(err);
    }
  }

  async razorpayWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = (req.headers["x-razorpay-signature"] as string) || null;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      const isValid = verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        return sendError(res, 400, "Invalid webhook signature", "BAD_SIGNATURE");
      }

      const event = req.body?.event;
      if (event === "payment.captured") {
        const p = req.body?.payload?.payment?.entity;
        if (p?.order_id && p?.id) {
          await paymentService.confirmPayment({
            orderId: p.order_id,
            paymentId: p.id,
            method: p.method,
          });
        }
      } else if (event === "order.paid") {
        const p = req.body?.payload?.payment?.entity;
        const o = req.body?.payload?.order?.entity;
        const orderId = p?.order_id || o?.id;
        const paymentId = p?.id;
        if (orderId && paymentId) {
          await paymentService.confirmPayment({
            orderId,
            paymentId,
            method: p?.method,
          });
        }
      } else if (event === "payment.failed") {
        const p = req.body?.payload?.payment?.entity;
        if (p?.order_id) {
          await paymentService.recordPaymentFailure({
            orderId: p.order_id,
            kind: "failed",
            reason: p.error_description || "Payment failed at gateway",
          });
        }
      }

      return sendSuccess(res, { status: "ok" });
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
