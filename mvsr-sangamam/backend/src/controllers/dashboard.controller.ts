import { Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service";
import { sendSuccess } from "../utils/response.util";
import { AuthenticatedRequest } from "../types";

export class DashboardController {
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const data = await dashboardService.getUserDashboard(user.id);
      return sendSuccess(res, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        ...data,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();
