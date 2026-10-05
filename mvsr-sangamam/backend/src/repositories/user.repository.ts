import { prisma } from "../db/prisma.client";
import { Role, User } from "@prisma/client";

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async create(data: {
    name: string;
    email: string;
    phone: string;
    college: string;
    studentId?: string | null;
    passwordHash: string;
    role?: Role;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase().trim(),
        role: data.role ?? "PARTICIPANT",
      },
    });
  }

  async updateRole(email: string, role: Role): Promise<User> {
    return prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { role },
    });
  }

  async count(): Promise<number> {
    return prisma.user.count();
  }
}

export const userRepository = new UserRepository();
