import { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.service";
import { promoteUserSchema } from "../validators/admin.validator";
import { sendSuccess } from "../utils/response.util";

export class AdminController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.q ? String(req.query.q) : undefined;
      const eventFilter = req.query.event ? String(req.query.event) : undefined;
      const overview = await adminService.getAdminOverview(search, eventFilter);
      return sendSuccess(res, overview);
    } catch (err) {
      next(err);
    }
  }

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await adminService.exportRegistrationsCsv();
      const filename = `sangamam-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }

  async promoteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const input = promoteUserSchema.parse(req.body);
      const result = await adminService.promoteUser(input.email, input.role);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
