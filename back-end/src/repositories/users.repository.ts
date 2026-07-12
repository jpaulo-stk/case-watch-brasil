import { AppDataSource } from "../config/data-source.ts";
import { User } from "../entities/user.entity.ts";

export const UsersRepository = AppDataSource.getRepository(User).extend({
  findById(id: number): Promise<User | null> {
    return this.findOne({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  },

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.email = :email", { email })
      .getOne();
  },

  findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  },

  // busca por email parcial (autocomplete de colaboradores)
  searchByEmail(query: string): Promise<User[]> {
    return this.createQueryBuilder("user")
      .where("user.email ILIKE :q", { q: `%${query}%` })
      .orderBy("user.email", "ASC")
      .limit(8)
      .getMany();
  },
});
