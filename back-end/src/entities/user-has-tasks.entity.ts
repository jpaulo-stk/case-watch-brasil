import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from "typeorm";
import { User } from "./user.entity.ts";
import { Task } from "./task.entity.ts";

export type CollaboratorRole = "viewer" | "editor";

@Entity()
export class UserHasTasks {
  @PrimaryColumn({ name: "user_id", type: "int" })
  userId!: number;

  @PrimaryColumn({ name: "task_id", type: "int" })
  taskId!: number;

  @Column({ type: "enum", enum: ["viewer", "editor"], default: "viewer" })
  role!: CollaboratorRole;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Task)
  @JoinColumn({ name: "task_id" })
  task!: Task;
}
