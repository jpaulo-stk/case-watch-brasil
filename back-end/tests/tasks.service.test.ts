import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../src/errors/http-errors.ts";

const tasksRepo = {
  findById: jest.fn<(...args: any[]) => any>(),
  findByUserId: jest.fn<(...args: any[]) => any>(),
  findOne: jest.fn<(...args: any[]) => any>(),
  create: jest.fn<(...args: any[]) => any>(),
  save: jest.fn<(...args: any[]) => any>(),
  softDelete: jest.fn<(...args: any[]) => any>(),
};
const collabRepo = {
  findOne: jest.fn<(...args: any[]) => any>(),
  find: jest.fn<(...args: any[]) => any>(),
  create: jest.fn<(...args: any[]) => any>(),
  save: jest.fn<(...args: any[]) => any>(),
  remove: jest.fn<(...args: any[]) => any>(),
};
const usersRepo = {
  findById: jest.fn<(...args: any[]) => any>(),
};

jest.unstable_mockModule("../src/repositories/tasks.repository.ts", () => ({
  TasksRepository: tasksRepo,
}));
jest.unstable_mockModule(
  "../src/repositories/user-has-tasks.repository.ts",
  () => ({ UserHasTasksRepository: collabRepo }),
);
jest.unstable_mockModule("../src/repositories/users.repository.ts", () => ({
  UsersRepository: usersRepo,
}));

const { TasksService } = await import("../src/services/tasks.service.ts");

const owner = 1;
const other = 2;
const ownedTask = { id: 10, user: { id: owner } };

describe("TasksService", () => {
  let service: InstanceType<typeof TasksService>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TasksService();
  });

  describe("getTaskById (assertCanView)", () => {
    it("NotFoundError quando a task não existe", async () => {
      tasksRepo.findById.mockResolvedValue(null);
      await expect(service.getTaskById(99, owner)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("o dono acessa sem consultar colaboração", async () => {
      tasksRepo.findById.mockResolvedValue(ownedTask);
      const result = await service.getTaskById(10, owner);
      expect(result).toBe(ownedTask);
      expect(collabRepo.findOne).not.toHaveBeenCalled();
    });

    it("um colaborador (viewer) acessa", async () => {
      tasksRepo.findById.mockResolvedValue({ id: 10, user: { id: other } });
      collabRepo.findOne.mockResolvedValue({ role: "viewer" });
      await expect(service.getTaskById(10, owner)).resolves.toBeDefined();
    });

    it("ForbiddenError para quem não é dono nem colaborador", async () => {
      tasksRepo.findById.mockResolvedValue({ id: 10, user: { id: other } });
      collabRepo.findOne.mockResolvedValue(null);
      await expect(service.getTaskById(10, owner)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe("updateStatus (assertCanEdit)", () => {
    it("colaborador EDITOR pode mudar o status", async () => {
      tasksRepo.findById.mockResolvedValue({ id: 10, user: { id: other } });
      collabRepo.findOne.mockResolvedValue({ role: "editor" });
      tasksRepo.save.mockImplementation(async (t: unknown) => t);

      const result = await service.updateStatus(10, "done", owner);

      expect(result).toMatchObject({ status: "done" });
      expect(tasksRepo.save).toHaveBeenCalled();
    });

    it("colaborador VIEWER é barrado (ForbiddenError)", async () => {
      tasksRepo.findById.mockResolvedValue({ id: 10, user: { id: other } });
      collabRepo.findOne.mockResolvedValue({ role: "viewer" });

      await expect(service.updateStatus(10, "done", owner)).rejects.toThrow(
        ForbiddenError,
      );
      expect(tasksRepo.save).not.toHaveBeenCalled();
    });
  });

  describe("deleteTask", () => {
    it("ForbiddenError se não é o dono", async () => {
      tasksRepo.findById.mockResolvedValue({ id: 10, user: { id: other } });
      await expect(service.deleteTask(10, owner)).rejects.toThrow(
        ForbiddenError,
      );
      expect(tasksRepo.softDelete).not.toHaveBeenCalled();
    });

    it("softDelete quando é o dono", async () => {
      tasksRepo.findById.mockResolvedValue(ownedTask);
      await service.deleteTask(10, owner);
      expect(tasksRepo.softDelete).toHaveBeenCalledWith(10);
    });
  });

  describe("addCollaborator", () => {
    it("NotFoundError se a task não existe", async () => {
      tasksRepo.findById.mockResolvedValue(null);
      await expect(
        service.addCollaborator(10, other, "viewer", owner),
      ).rejects.toThrow(NotFoundError);
    });

    it("ForbiddenError se quem chama não é o dono", async () => {
      tasksRepo.findById.mockResolvedValue({ id: 10, user: { id: other } });
      await expect(
        service.addCollaborator(10, 3, "viewer", owner),
      ).rejects.toThrow(ForbiddenError);
    });

    it("BadRequestError ao tentar adicionar o próprio dono", async () => {
      tasksRepo.findById.mockResolvedValue(ownedTask);
      await expect(
        service.addCollaborator(10, owner, "editor", owner),
      ).rejects.toThrow(BadRequestError);
    });

    it("NotFoundError se o usuário colaborador não existe", async () => {
      tasksRepo.findById.mockResolvedValue(ownedTask);
      usersRepo.findById.mockResolvedValue(null);
      await expect(
        service.addCollaborator(10, other, "editor", owner),
      ).rejects.toThrow(NotFoundError);
    });

    it("ConflictError se já é colaborador", async () => {
      tasksRepo.findById.mockResolvedValue(ownedTask);
      usersRepo.findById.mockResolvedValue({ id: other });
      collabRepo.findOne.mockResolvedValue({ userId: other, taskId: 10 });
      await expect(
        service.addCollaborator(10, other, "editor", owner),
      ).rejects.toThrow(ConflictError);
    });

    it("adiciona quando tudo é válido", async () => {
      tasksRepo.findById.mockResolvedValue(ownedTask);
      usersRepo.findById.mockResolvedValue({ id: other });
      collabRepo.findOne.mockResolvedValue(null);
      collabRepo.create.mockReturnValue({ userId: other, taskId: 10 });
      collabRepo.save.mockResolvedValue({});

      await service.addCollaborator(10, other, "editor", owner);

      expect(collabRepo.create).toHaveBeenCalledWith({
        task: { id: 10 },
        user: { id: other },
        role: "editor",
      });
      expect(collabRepo.save).toHaveBeenCalled();
    });
  });

  describe("getTasksByUserId", () => {
    it("junta tasks próprias e compartilhadas sem duplicar", async () => {
      tasksRepo.findByUserId.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      collabRepo.find.mockResolvedValue([
        { task: { id: 3 } },
        { task: { id: 1 } },
      ]);

      const result = await service.getTasksByUserId(owner);

      expect(result.map((t) => t.id).sort()).toEqual([1, 2, 3]);
    });
  });
});
