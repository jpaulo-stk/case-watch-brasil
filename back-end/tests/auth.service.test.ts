import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { UnauthorizedError } from "../src/errors/http-errors.ts";

const usersRepo = {
  findByEmailWithPassword: jest.fn<(...args: any[]) => any>(),
};
const bcryptMock = { compare: jest.fn<(...args: any[]) => any>() };
const jwtMock = { sign: jest.fn<(...args: any[]) => any>() };

jest.unstable_mockModule("../src/repositories/users.repository.ts", () => ({
  UsersRepository: usersRepo,
}));
jest.unstable_mockModule("bcrypt", () => ({ default: bcryptMock }));
jest.unstable_mockModule("jsonwebtoken", () => ({ default: jwtMock }));

const { AuthService } = await import("../src/services/auth.service.ts");

describe("AuthService.login", () => {
  let service: InstanceType<typeof AuthService>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
  });

  it("UnauthorizedError se o email não existe", async () => {
    usersRepo.findByEmailWithPassword.mockResolvedValue(null);
    await expect(service.login("nao@existe.com", "x")).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("UnauthorizedError se a senha não bate", async () => {
    usersRepo.findByEmailWithPassword.mockResolvedValue({
      id: 1,
      passwordHash: "hash",
    });
    bcryptMock.compare.mockResolvedValue(false);
    await expect(service.login("a@x.com", "errada")).rejects.toThrow(
      UnauthorizedError,
    );
    expect(jwtMock.sign).not.toHaveBeenCalled();
  });

  it("retorna token + user SEM passwordHash quando as credenciais batem", async () => {
    usersRepo.findByEmailWithPassword.mockResolvedValue({
      id: 1,
      name: "João",
      email: "a@x.com",
      passwordHash: "hash-secreto",
    });
    bcryptMock.compare.mockResolvedValue(true);
    jwtMock.sign.mockReturnValue("fake.jwt.token");

    const result = await service.login("a@x.com", "correta");

    expect(result.token).toBe("fake.jwt.token");
    expect(result.user).toMatchObject({ id: 1, email: "a@x.com" });
    expect(result.user).not.toHaveProperty("passwordHash");
  });
});
