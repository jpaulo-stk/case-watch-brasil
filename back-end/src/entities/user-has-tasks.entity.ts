import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from "typeorm";
import { User } from "./user.entity.ts";
import { Task } from "./task.entity.ts";

export const COLLABORATOR_ROLES = ["viewer", "editor"] as const;
export type CollaboratorRole = (typeof COLLABORATOR_ROLES)[number];

@Entity()
export class UserHasTasks {
  @PrimaryColumn({ name: "user_id", type: "int" })
  userId!: number;

  @PrimaryColumn({ name: "task_id", type: "int" })
  taskId!: number;

  @Column({ type: "enum", enum: [...COLLABORATOR_ROLES], default: "viewer" })
  role!: CollaboratorRole;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Task)
  @JoinColumn({ name: "task_id" })
  task!: Task;
}
