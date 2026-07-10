import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository.ts";
import type { CreateUserDTO } from "../dto/user.dto.ts";
import { ConflictError, NotFoundError } from "../errors/http-errors.ts";

export class UserService {
  async create(data: CreateUserDTO) {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("Email already in use");
    }

    const existingUsername = await UserRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError("Username already in use");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = UserRepository.create({
      name: data.name,
      email: data.email,
      username: data.username,
      passwordHash,
      phone: data.phone || null,
    });

    return UserRepository.save(user);
  }

  async findById(id: number) {
    return UserRepository.findOneBy({ id });
  }

  async update(id: number, data: Partial<CreateUserDTO>) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (data.email && data.email !== user.email) {
      const existing = await UserRepository.findByEmail(data.email);
      if (existing) {
        throw new ConflictError("Email already in use");
      }
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await UserRepository.findByUsername(
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

    return UserRepository.save(user);
  }

  async delete(id: number) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return UserRepository.softRemove(user);
  }
}
