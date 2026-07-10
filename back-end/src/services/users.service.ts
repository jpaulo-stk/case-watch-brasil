import bcrypt from "bcrypt";
import { UsersRepository } from "../repositories/users.repository.ts";
import type { CreateUserDTO } from "../dto/user.dto.ts";
import { ConflictError, NotFoundError } from "../errors/http-errors.ts";
import type { User } from "../entities/user.entity.ts";

export class UsersService {
  async create(data: CreateUserDTO): Promise<User> {
    const existing = await UsersRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("Email already in use");
    }

    const existingUsername = await UsersRepository.findByUsername(
      data.username,
    );
    if (existingUsername) {
      throw new ConflictError("Username already in use");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = UsersRepository.create({
      name: data.name,
      email: data.email,
      username: data.username,
      passwordHash,
      phone: data.phone || null,
    });

    return UsersRepository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return UsersRepository.findOneBy({ id });
  }

  async update(id: number, data: Partial<CreateUserDTO>): Promise<User> {
    const user = await UsersRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (data.email && data.email !== user.email) {
      const existing = await UsersRepository.findByEmail(data.email);
      if (existing) {
        throw new ConflictError("Email already in use");
      }
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await UsersRepository.findByUsername(
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

    return UsersRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await UsersRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await UsersRepository.softRemove(user);
  }
}
