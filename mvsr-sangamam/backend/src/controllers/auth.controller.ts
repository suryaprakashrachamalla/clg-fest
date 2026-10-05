import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { signupSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../validators/auth.validator";
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
    if (!req.user) {
      return sendSuccess(res, { user: null });
    }
    const { passwordHash: _hash, ...safeUser } = req.user;
    return sendSuccess(res, { user: safeUser });
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = updateProfileSchema.parse(req.body);
      const updatedUser = await authService.updateProfile(req.user!.id, input);
      return sendSuccess(res, { user: updatedUser });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = changePasswordSchema.parse(req.body);
      const result = await authService.changePassword(req.user!.id, input);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
