import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../src/errors/http-errors.ts";

const mockRepo = {
  findOneBy: jest.fn<(...args: any[]) => any>(),
  findById: jest.fn<(...args: any[]) => any>(),
  save: jest.fn<(...args: any[]) => any>(),
  findByUserId: jest.fn<(...args: any[]) => any>(),
  softDelete: jest.fn<(...args: any[]) => any>(),
};

jest.unstable_mockModule(
  "../src/repositories/categories.repository.ts",
  () => ({
    CategoryRepository: mockRepo,
  }),
);

const { CategoryService } =
  await import("../src/services/categories.service.ts");

describe("CategoryService", () => {
  let service: InstanceType<typeof CategoryService>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoryService();
  });

  describe("createCategory", () => {
    it("lança ConflictError se já existe categoria com o nome para o usuário", async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 1, name: "Trabalho" });

      await expect(service.createCategory("Trabalho", 1)).rejects.toThrow(
        ConflictError,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("cria e salva quando não há duplicado", async () => {
      mockRepo.findOneBy.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue({ id: 10, name: "Nova" });

      const result = await service.createCategory("Nova", 1);

      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 10, name: "Nova" });
    });
  });

  describe("deleteCategory", () => {
    it("lança NotFoundError se a categoria não existe", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.deleteCategory(99, 1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("lança ForbiddenError se o usuário não é o dono", async () => {
      mockRepo.findById.mockResolvedValue({ id: 1, user: { id: 2 } });

      await expect(service.deleteCategory(1, 1)).rejects.toThrow(
        ForbiddenError,
      );
      expect(mockRepo.softDelete).not.toHaveBeenCalled();
    });

    it("faz softDelete quando é o dono", async () => {
      mockRepo.findById.mockResolvedValue({ id: 1, user: { id: 1 } });
      mockRepo.softDelete.mockResolvedValue({});

      await service.deleteCategory(1, 1);

      expect(mockRepo.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
