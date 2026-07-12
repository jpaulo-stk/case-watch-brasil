import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ConflictError, NotFoundError } from "../src/errors/http-errors.ts";

const usersRepo = {
  findByEmail: jest.fn<(...args: any[]) => any>(),
  findByUsername: jest.fn<(...args: any[]) => any>(),
  findById: jest.fn<(...args: any[]) => any>(),
  findOneBy: jest.fn<(...args: any[]) => any>(),
  create: jest.fn<(...args: any[]) => any>(),
  save: jest.fn<(...args: any[]) => any>(),
  softRemove: jest.fn<(...args: any[]) => any>(),
};
const bcryptMock = {
  hash: jest.fn<(...args: any[]) => any>(),
  compare: jest.fn<(...args: any[]) => any>(),
};

jest.unstable_mockModule("../src/repositories/users.repository.ts", () => ({
  UsersRepository: usersRepo,
}));
jest.unstable_mockModule("bcryptjs", () => ({ default: bcryptMock }));

const { UsersService } = await import("../src/services/users.service.ts");

const validInput = {
  name: "João",
  email: "joao@example.com",
  username: "joao",
  password: "secret123",
  phone: "11999999999",
};

describe("UsersService", () => {
  let service: InstanceType<typeof UsersService>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService();
  });

  describe("create", () => {
    it("ConflictError se o email já existe", async () => {
      usersRepo.findByEmail.mockResolvedValue({ id: 1 });
      await expect(service.create(validInput)).rejects.toThrow(ConflictError);
      expect(bcryptMock.hash).not.toHaveBeenCalled();
    });

    it("ConflictError se o username já existe", async () => {
      usersRepo.findByEmail.mockResolvedValue(null);
      usersRepo.findByUsername.mockResolvedValue({ id: 1 });
      await expect(service.create(validInput)).rejects.toThrow(ConflictError);
    });

    it("hasheia a senha e salva quando não há conflito", async () => {
      usersRepo.findByEmail.mockResolvedValue(null);
      usersRepo.findByUsername.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValue("hashed-pw");
      usersRepo.create.mockReturnValue({ id: 1 });
      usersRepo.save.mockResolvedValue({ id: 1 });

      await service.create(validInput);

      // a senha crua vira hash antes de salvar (nunca vai crua pro banco)
      expect(bcryptMock.hash).toHaveBeenCalledWith("secret123", 10);
      expect(usersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: "hashed-pw" }),
      );
      expect(usersRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    it("NotFoundError se o usuário não existe", async () => {
      usersRepo.findById.mockResolvedValue(null);
      await expect(service.update(99, { name: "x" })).rejects.toThrow(
        NotFoundError,
      );
    });

    it("ConflictError se o novo email já está em uso", async () => {
      usersRepo.findById.mockResolvedValue({ id: 1, email: "old@x.com" });
      usersRepo.findByEmail.mockResolvedValue({ id: 2 });
      await expect(
        service.update(1, { email: "novo@x.com" }),
      ).rejects.toThrow(ConflictError);
    });

    it("atualiza e salva quando ok", async () => {
      usersRepo.findById.mockResolvedValue({
        id: 1,
        name: "old",
        email: "a@x.com",
        username: "old",
      });
      usersRepo.save.mockImplementation(async (u: unknown) => u);

      const result = await service.update(1, { name: "Novo Nome" });

      expect(result).toMatchObject({ name: "Novo Nome" });
      expect(usersRepo.save).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("NotFoundError se o usuário não existe", async () => {
      usersRepo.findById.mockResolvedValue(null);
      await expect(service.delete(99)).rejects.toThrow(NotFoundError);
    });

    it("softRemove quando o usuário existe", async () => {
      const user = { id: 1 };
      usersRepo.findById.mockResolvedValue(user);
      await service.delete(1);
      expect(usersRepo.softRemove).toHaveBeenCalledWith(user);
    });
  });
});
