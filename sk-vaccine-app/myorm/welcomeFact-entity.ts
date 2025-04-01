import "reflect-metadata";
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "./decorators";
import BaseEntity from "./base-entity";
import { WelcomeFact } from "@/interfaces/iWelcomeFact";

@Entity()
export default class WelcomeFactEntity
  extends BaseEntity
  implements WelcomeFact
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ tsType: String })
  message: string;

  @Column({ tsType: String, isNullable: false })
  language: "english" | "french";

  constructor(data?: Partial<WelcomeFact>) {
    super();
    if (data) {
      (this.message = data.message ?? ""), (this.language = data.language!);
    }
  }
}
