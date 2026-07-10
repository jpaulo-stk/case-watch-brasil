import { UserRepository } from "../repositories/user.repository.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/http-errors.ts";

export class AuthService {
  async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user?.passwordHash!);

    if (!user || !passwordMatches) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = jwt.sign({ userId: user?.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const { passwordHash, ...rest } = user;

    return { token, user: rest };
  }
}
