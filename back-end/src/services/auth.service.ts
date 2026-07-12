import { UsersRepository } from "../repositories/users.repository.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/http-errors.ts";

export class AuthService {
  async login(email: string, password: string) {
    const user = await UsersRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedError("Email ou senha inválidos");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError("Email ou senha inválidos");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const { passwordHash, ...rest } = user;
    return { token, user: rest };
  }
}
