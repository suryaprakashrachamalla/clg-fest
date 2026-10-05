import { Router } from "express";
import { authRouter } from "./auth.routes";
import { eventRouter } from "./event.routes";
import { registrationRouter } from "./registration.routes";
import { paymentRouter } from "./payment.routes";
import { teamRouter } from "./team.routes";
import { checkinRouter } from "./checkin.routes";
import { adminRouter } from "./admin.routes";
import { dashboardRouter } from "./dashboard.routes";
import { paymentController } from "../controllers/payment.controller";
import { checkinController } from "../controllers/checkin.controller";
import { eventController } from "../controllers/event.controller";
import { requireAdmin } from "../middlewares/auth.middleware";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/events", eventRouter);
apiRouter.use("/registrations", registrationRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/teams", teamRouter);
apiRouter.use("/checkin", checkinRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/dashboard", dashboardRouter);

// Direct endpoint aliases for full backward & frontend compatibility
apiRouter.get("/v/:token", (req, res, next) => checkinController.getVerificationCard(req, res, next));
apiRouter.post("/webhooks/razorpay", (req, res, next) => paymentController.razorpayWebhook(req, res, next));

// Admin nested event routes under /admin/events
apiRouter.post("/admin/events", requireAdmin, (req, res, next) => eventController.createEvent(req, res, next));
apiRouter.put("/admin/events/:id", requireAdmin, (req, res, next) => eventController.updateEvent(req, res, next));
apiRouter.delete("/admin/events/:id", requireAdmin, (req, res, next) => eventController.deleteEvent(req, res, next));
