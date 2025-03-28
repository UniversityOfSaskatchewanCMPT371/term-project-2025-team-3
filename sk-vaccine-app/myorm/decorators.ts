import { InvalidArgumentError, InvalidEntityError } from "@/utils/ErrorTypes";
import logger from "@/utils/logger";
import "reflect-metadata";
import BaseEntity from "./base-entity";
import * as SQLite from "expo-sqlite";
import { promisify } from "util";

const DB_NAME = "sk-vaccine-app.db";

export interface ColumnOptions {
  /** The name of the row in the db */
  name?: string;
  /**
   * The sql row type, either `tsType` or `type` must be set.
   *  `type` takes presedence over `tsType`
   */
  type?: string;
  /** Set to store a list of elements as a json*/
  isList?: boolean;
  /** Is it the primary key column */
  isPrimary?: boolean;
  /** Can the row hold the value of null, `false` by default */
  isNullable?: boolean;
  /** Must every value in this column be unique, `false` by default */
  isUnique?: boolean;
  /**
   * typescript type, either `tsType` or `type` must be set.
   * `type` takes presedence over `tsType`
   */
  tsType?: any;
}

export interface ColumnMetadata extends ColumnOptions {
  /** The attribute name */
  propertyKey: string;
}

export interface EntityConstructor extends Function {
  // constructor signature so type can be retrieved
  prototype: EntityPrototype;
}

export interface EntityPrototype {
  _columns?: ColumnMetadata[];
  _primaryKey?: string;
  _tableName?: string;
}

/**
 * Decorator for creating a column in the database.
 * @precondition This decorator must be used on a class that extends `BaseEntity`.
 *  The class must have a `Entity` on it and exactly one of the attributes must be set
 *  as a primary column.
 * @param options Properties of the row in the database see {@link ColumnOptions},
 *      `options.tsType` or `options.type` must be set
 * @returns Returns a decorator function that will be applied to an attribute.
 * @throws {InvalidEntityError} If the type of the attribute is not valid
 */
export function Column(options?: ColumnOptions) {
  /**
   * Returns a decorator function that will be applied to an attribute.
   * @param target The prototype of the class.
   * @param propertyKey The name of the property being decorated.
   * @throws {InvalidEntityError} If the type of the object is not valid
   */
  return function (target: any, propertyKey: string) {
    const prototype = target.constructor.prototype as EntityPrototype;

    if (!options?.tsType && !options?.type) {
      throw new InvalidEntityError(
        "options.tsType or options.type must be set"
      );
    }

    // initialize metadata storage on the prototype
    if (!prototype._columns) {
      prototype._columns = [] as ColumnMetadata[];
    }

    // get the type of the attribute
    // "design:type" is the type the attribute is declared as
    // DOES NOT WORK. SOMETHING IS WRONG WITH THE COMPILER
    // const designType = Reflect.getMetadata("design:type", target, propertyKey);

    // set primary key
    if (options?.isPrimary) {
      prototype._primaryKey = propertyKey;
    }

    // add a new metadata object into the "_columns" array
    // it stores data about the column
    prototype._columns.push({
      propertyKey: propertyKey,
      name: options?.name || propertyKey,
      type: options?.type || mapTsTypeToSql(options?.tsType, options?.isList),
      isUnique: options?.isUnique || false,
      isList: options?.isList || false,
      isPrimary: options?.isPrimary || false,
      isNullable: options?.isNullable || false,
    } as ColumnMetadata);
  };
}

/**
 * Decorator for marking a property as the primary key.
 * @precondition This decorator must be used on a class that extends `BaseEntity`.
 *  The class must have a `Entity` on it and there can only be one primary column.
 * @param options Properties of the row in the database see {@link ColumnOptions}.
 *  must define `options.tsType` or `options.type`.
 * @returns Returns a decorator function that will be applied to an attribute.
 */
export function PrimaryGeneratedColumn(
  options?: Omit<ColumnOptions, "isPrimary">
) {
  return function (target: any, propertyKey: string) {
    Column({ ...options, isPrimary: true, type: options?.type || "INTEGER" })(
      target,
      propertyKey
    );
  };
}

/**
 * Decorator for lists. The value is stored as a json but returned as a list.
 * @param options Properties of the row in the database see {@link ColumnOptions}
 * @returns Returns a decorator function that will be applied to an attribute.
 */
export function List(options?: Omit<ColumnOptions, "isList">) {
  return Column({ ...options, type: "TEXT", isList: true });
}

/**
 * Maps types to SQL types for the types:
 * String, Number, Boolean and Array, otherwise the value is stored as text
 *
 * @param type The type to map, must be String, Number, Boolean and Array
 * @param isList If the data is a list
 * @returns The sql type as a string
 * @throws {InvalidEntityError} if the type is invalid.
 */
export function mapTsTypeToSql(jsType: any, isList?: boolean): string {
  if (isList) {
    return "TEXT";
  }
  if (jsType === String) {
    return "TEXT";
  }
  if (jsType === Number) {
    return "REAL";
  }
  if (jsType === Boolean) {
    return "INTEGER";
  }
  if (jsType === Array) {
    return "TEXT";
  }
  throw new InvalidEntityError(`${jsType} is not a valid column type`);
}

/**
 * Class decorator that creates a table for the class.
 * @precondition This must be on a table that extends BaseEntity and have exactly one
 *  primary column
 * @param options.tableName The name of the table. Maximum 64 characters. Can contain
 *  capital and lower case letters, underscores, and `$`.
 * @param options.immutable If the columns change should the table be cleared amd
 *      rebuilt. There is currently no way to add database migrations to the table
 *      because it is not needed.
 * @throws {InvalidEntityError} If there is no primary column
 */
export function Entity(options?: { tableName?: string; immutable?: boolean }) {
  options = options || {};
  return function (constructor: Function) {

    let db: SQLite.SQLiteDatabase;
    
    if (BaseEntity.db == undefined) {
      BaseEntity.db = SQLite.openDatabaseSync(DB_NAME);
      logger.debug("Database initialized successfully:");
    }
    db = BaseEntity.db;

    logger.info(
      "Entity initialization starting, should run after db initialization unless this is a test"
    );

    let sql: string;

    const prototype = constructor.prototype;
    // store table name in the prototype (default is lowercase class name)
    prototype._tableName = options.tableName || constructor.name.toLowerCase();

    // if immutable remove table if the fields have changed
    if (options.immutable) {
      const result = db.getAllSync(
        `PRAGMA table_info('${prototype._tableName}');`
      );
      const tableColumns = result
        .map((col: any) => {
          return {
            name: col.name,
            type: col.type,
            isNullable: !col.notnull,
            primaryKey: col.pk,
          };
        })
        .sort();

      const entityColumns = prototype._columns
        ?.map((col: any) => {
          return {
            name: col.name,
            type: col.type,
            isNullable: col.isNullable,
            isPrimary: col.isPrimary,
          };
        })
        .sort();

      if (JSON.stringify(tableColumns) != JSON.stringify(entityColumns)) {
        db.execSync(`DROP TABLE IF EXISTS ${prototype._tableName};`);
      }
    }
    // generate sql table.

    sql = createTable(constructor.prototype);
    //logger.debug(sql);

    db.execSync(sql);

    logger.info(`created table for entity ${constructor.name}:`);
  };
}

/**
 * Creates a table for an entity if it does not exist.
 * @param prototype The metadata for the table. All of the attributes must
 *  be defined.
 * @returns An sql statement that builds a table
 * @throws {InvalidEntityError} If the prototype has undefined values
 */
function createTable(prototype: EntityPrototype): string {
  const tableName = prototype._tableName;

  if (tableName == undefined) {
    throw new InvalidEntityError(`No tablename defined in table: ${tableName}`);
  }

  if (prototype._columns == undefined || prototype._columns.length == 0) {
    throw new InvalidEntityError(`No columns defined in table: ${tableName}`);
  }

  const columns = prototype._columns;

  let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

  // create primary key column
  const pkColumn = columns.find((col: ColumnMetadata) => col.isPrimary);
  if (!pkColumn) {
    throw new InvalidEntityError(
      `No primary key defined in table: ${tableName}`
    );
  }
  sql += `  ${pkColumn.name} INTEGER PRIMARY KEY AUTOINCREMENT,\n`;

  // make sure there is only one primary key
  let primaryCount = 0;

  // add other columns
  columns.forEach((col: ColumnMetadata) => {
    // skip primary key (already added)
    if (col.isPrimary) {
      primaryCount++;
      if (primaryCount > 1) {
        throw new InvalidEntityError(
          `Multiple primary keys defined in table: ${tableName}`
        );
      }
      return;
    }
    if (col.isNullable) {
      sql += `  ${col.name} ${col.type} NULL,\n`;
    } else if (col.isUnique) {
      sql += `  ${col.name} ${col.type} UNIQUE, \n`;
    } else {
      sql += `  ${col.name} ${col.type} NOT NULL,\n`;
    }
  });

  // end the sql statement
  sql = sql.slice(0, -2) + "\n);";
  return sql;
}
