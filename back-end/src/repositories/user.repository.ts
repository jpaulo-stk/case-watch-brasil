import { AppDataSource } from "../config/data-source.ts";
import { User } from "../entities/user.entity.ts";

export const UserRepository = AppDataSource.getRepository(User).extend({
  findById(id: number): Promise<User | null> {
    return this.findOne({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  },

  findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  },
});
