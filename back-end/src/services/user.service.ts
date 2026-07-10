import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository.ts";
import type { CreateUserInput } from "../dto/user.dto.ts";
import { ConflictError, NotFoundError } from "../errors/http-errors.ts";

export class UserService {
  async create(data: CreateUserInput) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("Email already in use");
    }

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError("Username already in use");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = userRepository.create({
      name: data.name,
      email: data.email,
      username: data.username,
      passwordHash,
      phone: data.phone || null,
    });

    return userRepository.save(user);
  }

  async findById(id: number) {
    return userRepository.findOneBy({ id });
  }

  async update(id: number, data: Partial<CreateUserInput>) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (data.email && data.email !== user.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing) {
        throw new ConflictError("Email already in use");
      }
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await userRepository.findByUsername(
        data.username,
      );
      if (existingUsername) {
        throw new ConflictError("Username already in use");
      }
    }

    user.name = data.name ?? user.name;
    user.email = data.email ?? user.email;
    user.username = data.username ?? user.username;
    user.phone = data.phone ?? user.phone;

    return userRepository.save(user);
  }

  async delete(id: number) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return userRepository.softRemove(user);
  }
}
