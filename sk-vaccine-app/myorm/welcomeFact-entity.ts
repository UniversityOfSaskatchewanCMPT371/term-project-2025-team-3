import "reflect-metadata";
import { Column, Entity, PrimaryGeneratedColumn } from "./decorators";
import BaseEntity from "./base-entity";
import { WelcomeFact } from "@/interfaces/iWelcomeFact";
/*
const decorators = process.env.NODE_ENV === "test"
  ? require("./decorators-sqlite") // for testing environment
  : require("./decorators"); // for production environment

const { Column, Entity, PrimaryGeneratedColumn } = decorators;
const BaseEntity =
  process.env.NODE_ENV === "test"
    ? require("./base-entity-sqlite").default
    : require("./base-entity").default;
  */

@Entity()
export default class WelcomeFactEntity extends BaseEntity implements WelcomeFact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ tsType: String, isUnique: true })
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
