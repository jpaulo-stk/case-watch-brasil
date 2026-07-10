import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity.ts";
import { Category } from "./category.entity.ts";

export type TaskStatus = "pending" | "in_progress" | "review" | "done";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255 })
  description!: string;

  @Column({
    type: "enum",
    enum: ["pending", "in_progress", "review", "done"],
    default: "pending",
  })
  status!: TaskStatus;

  @Column({ name: "deadline", type: "timestamp", nullable: true })
  deadline!: Date | null;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date;
}
