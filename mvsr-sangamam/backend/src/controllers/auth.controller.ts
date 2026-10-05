import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { signupSchema, loginSchema } from "../validators/auth.validator";
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "../utils/jwt.util";
import { sendSuccess } from "../utils/response.util";
import { AuthenticatedRequest } from "../types";

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const input = signupSchema.parse(req.body);
      const result = await authService.signup(input);

      res.cookie(SESSION_COOKIE, result.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_TTL_SECONDS * 1000,
        path: "/",
      });

      return sendSuccess(res, { user: result.user, token: result.token }, 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input);

      res.cookie(SESSION_COOKIE, result.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_TTL_SECONDS * 1000,
        path: "/",
      });

      return sendSuccess(res, { user: result.user, token: result.token });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    return sendSuccess(res, { success: true });
  }

  async getMe(req: AuthenticatedRequest, res: Response) {
    return sendSuccess(res, { user: req.user ?? null });
  }
}

export const authController = new AuthController();
