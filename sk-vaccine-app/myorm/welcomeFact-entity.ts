import "reflect-metadata";
import {
  Column,
  Entity,
  EntityConstructor,
  PrimaryGeneratedColumn,
} from "./decorators";
import BaseEntity from "./base-entity";
import { WelcomeFact } from "@/interfaces/iWelcomeFact";
import { InvalidEntityError } from "@/utils/ErrorTypes";
import logger from "@/utils/logger";
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

  async save(): Promise<void> {
    // ensure prototype is properly defined

    const db = BaseEntity.db;

    const constructor = this.constructor as EntityConstructor;
    const prototype = constructor.prototype;

    const tableName = prototype._tableName;
    const pk = prototype._primaryKey;
    const columns = prototype._columns;

    const pkValue = (this as any)[pk!];

    // columns without primary key
    const cols = columns!.filter((col) => !col.isPrimary);

    const pkColumn = columns!.find((col) => col.isPrimary)!;

    // values for the columns
    const values = cols.map((col) => {
      let val = (this as any)[col.propertyKey];

      // check if non-nullable values are null
      if ((val === null || val === undefined) && !col.isNullable) {
        throw new InvalidEntityError(
          `Field "${col.propertyKey}" is ${val} and is not nullable`
        );
      }
      // store string as a list
      if (col.isList) {
        return JSON.stringify(val);
      }

      return val;
    }) as string[];
    const message = cols.map((col) => {
      if (col.propertyKey === "message") {
        return (this as any)[col.propertyKey];
      }
    });

    const { recordExists } = (await db.getFirstAsync(
      `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE message = ?) as recordExists;`,
      message[0]
    )) as any;
    // INSERT
    if (!recordExists) {
      // if id is defined insert it
      if (pkValue !== undefined && pkValue !== null) {
        cols.push(pkColumn);
        values.push(pkValue);
      }

      const colNames = cols.map((col) => col.name);

      const placeholders = cols.map((_) => "?").join(", ");

      logger.debug(
        `table ${tableName} info`,
        await db.runAsync(
          `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}';');`
        )
      );

      const sql = `INSERT INTO ${tableName} ( ${colNames.join(
        ", "
      )} ) VALUES ( ${placeholders} )`;
      const result = await db.runAsync(sql, ...values);
      (this as any)[pk!] = result.lastInsertRowId;
    }
    // UPDATE
    else {
      const assignments = cols.map((col) => `${col.name} = ?`);

      const sql = `UPDATE ${tableName} SET ${assignments.join(", ")} WHERE ${
        pkColumn.name
      } = ?`;

      values.push(pkValue);

      await db.runAsync(sql, ...values);
    }
  }
}
