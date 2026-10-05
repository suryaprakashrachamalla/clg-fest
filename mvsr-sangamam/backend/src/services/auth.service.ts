import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../utils/response.util";
import { signSession } from "../utils/jwt.util";
import { SignupInput, LoginInput } from "../validators/auth.validator";

const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8.Y8wYbF0bJ0uQ4pqfqB6v7b8F5k1e";

export class AuthService {
  async signup(input: SignupInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new HttpError(409, "An account with this email already exists.", "EMAIL_TAKEN");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      college: input.college,
      studentId: input.studentId,
      passwordHash,
    });

    const token = await signSession({
      sub: user.id,
      role: user.role,
      name: user.name,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        studentId: user.studentId,
        role: user.role,
      },
    };
  }

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    const valid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !valid) {
      throw new HttpError(401, "Incorrect email or password.", "BAD_CREDENTIALS");
    }

    const token = await signSession({
      sub: user.id,
      role: user.role,
      name: user.name,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        studentId: user.studentId,
        role: user.role,
      },
    };
  }
}

export const authService = new AuthService();
