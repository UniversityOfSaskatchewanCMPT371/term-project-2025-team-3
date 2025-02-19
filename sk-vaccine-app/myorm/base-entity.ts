import * as SQLite from 'expo-sqlite';
import { ColumnMetadata, EntityConstructor, EntityPrototype } from './decorators';
import { InvalidEntityError } from '@/utils/ErrorTypes';


// The function signatures is based off of the code in typeorm
// repository: https://github.com/typeorm/typeorm/blob/master/src/repository/BaseEntity.ts
// this is the part I stole:
// funName<T extends BaseEntity>(
//     this: { new (): T } & typeof BaseEntity,
// ): void {
    


/**
 * Core class for all db entities. Db entities
 * must extend this class.
 */
export default class BaseEntity implements EntityPrototype  {
    _columns?: ColumnMetadata[];
    _primaryKey?: string;
    _tableName?: string;

    /** 
     * A promise that resolves to the sqlite database connection.
     */
    static db: SQLite.SQLiteDatabase;
    static tableIsReady = false;

    /**
     * Finds and returns all records of the current entity.
     * @template T The type of the entity.
     * @returns An array of entities.
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     */
    static async find<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
    ): Promise<T[]> {

        // ensure prototype is properly defined
        (new this()).verifyPrototype();
        
        const db = this.db;



        const prototype = this.prototype as EntityPrototype;

        if (prototype._tableName == undefined) {
            throw new InvalidEntityError(`Entity prototype has undefined attribute: _tableName`);
        }

        const result = await db.getAllAsync(`SELECT * FROM ${prototype._tableName}`);
        


        return this.convertToObj<T>(result);;
    }


    /**
     * A helper function that takes the object returned by sqlite's `SQLiteDatabase.getAllAsync` 
     * and turns it into an object of type `T`.
     * @template T The type of the entity.
     * @returns An array of entities.
     */
    private static convertToObj<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
        queryResult: Array<any>
    ): T[] {

        const objArr: T[] = [];
        const prototype = this.prototype as EntityPrototype;



        
        queryResult!.forEach((row: any) => {

            // build a new object for each row in `result`
            const obj = new this() as any;
            prototype._columns!.forEach(col => {

                // verify that the object and database query contain the proper rows
                if (!(col.propertyKey in obj)) {
                    throw new InvalidEntityError(`Entity does not contain attribute: "${col.propertyKey}"`);
                }
                if (!(col.name! in row)) {
                    throw new InvalidEntityError(`Query result does not contain column: "${col.name}"`);
                }

                // convert string value to list
                if (col.isList) {
                    obj[col.propertyKey] = JSON.parse(row[col.name!]);
                }
                else {
                    obj[col.propertyKey] = row[col.name!];
                }


                
            });
            objArr.push(obj);
        });


        return objArr;
    }


    /**
     * Queries the database for objects where atleast one of the conditions are true.
     * Warning: Make sure conditions are sanitized for sql injections.
     * @template T The type of the entity.
     * @param firstCondition A sql condition (required)
     * @param conditions More sql conditions (optional)
     * @returns An array of entities where atleast one of the conditions are true.
     * 
     */
    static async where<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
        firstCondition: string,
        ...conditions: string[]
    ): Promise<T[]> {
        const db = this.db;
        const prototype = this.prototype as EntityPrototype;

        if (prototype._tableName == undefined) {
            throw new InvalidEntityError(`Entity prototype has undefined attribute: _tableName`);
        }


        let sql = `SELECT * FROM ${prototype._tableName} WHERE ${firstCondition}`;
        conditions.forEach((condition) => {
            sql += ` OR ${condition}`
        });

        sql += ';'
        const result = await db.getAllAsync(sql);
        
        return this.convertToObj<T>(result);
    }

    /**
     * Get the number of entities in the table.
     * @template T The type of the entity.
     * @returns The number of entities in the table.
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     */
    static async count<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
    ): Promise<number> {
        const prototype = this.prototype as EntityPrototype;
        // ensure prototype is properly defined
        (new this()).verifyPrototype();
        const db = this.db;
        const result = await db.getFirstAsync(`SELECT COUNT(*) as count FROM ${prototype._tableName}`) as any;
        return result.rows[0]['COUNT(*)'];
    }


    /**
     * Clears all entities from the table.
     * @template T The type of the entity.
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     */
    static async clear<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
    ): Promise<void> {
        // ensure prototype is properly defined
        (new this()).verifyPrototype();

        const db = this.db;
        const prototype = this.prototype as EntityPrototype;

        if (prototype._tableName == undefined) {
            throw new InvalidEntityError(`Entity prototype has undefined attribute: _tableName`);
        }


        await db.execAsync(`DELETE FROM ${prototype._tableName}`);
        return;
    }


    /**
     * Get a list of all database column names.
     * @template T The type of the entity.
     * @returns A list of column names.
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     */
    static getColumns<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
    ): Promise<Array<string>> {
        const prototype = this.prototype as EntityPrototype;


        // ensure prototype is properly defined
        (new this()).verifyPrototype();



        throw new Error("unimplimented");

    }


    /**
     * Checks if the prototype of the current class contains the information needed to
     * set up a table
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     */
    private verifyPrototype(): void {
        const prototype = this.constructor.prototype as EntityPrototype;

        const undefinedAttrs: string[] = []


        // check if the entity is defined correctly
        if (prototype._tableName == undefined) {
            undefinedAttrs.push("_tableName");
        }

        if (prototype._primaryKey == undefined) {
            undefinedAttrs.push("_primaryKey");
        }
        if (prototype._columns == undefined) {
            undefinedAttrs.push("_columns");
        }

        if (undefinedAttrs.length > 0) {
            throw new InvalidEntityError(`Entity prototype has undefined attribute(s): ${undefinedAttrs.join(', ')}`);
        }



        return;
    }

    /**
     * Saves the current object to the database.
     * @throws {InvalidEntityError} If a required field is empty or
     *      the entity prototype is not properly defined.
     */
    async save(): Promise<void> {


        // ensure prototype is properly defined
        this.verifyPrototype();



        const db = BaseEntity.db;

        const constructor = this.constructor as EntityConstructor;
        const prototype = constructor.prototype;

        const tableName = prototype._tableName;
        const pk = prototype._primaryKey;
        const columns = prototype._columns;


        const pkValue = (this as any)[pk!];


        // columns without primary key
        const cols = columns!.filter(col => !col.isPrimary);


        const pkColumn = columns!.find(col => col.isPrimary)!.name;


        // values for the columns
        const values = cols.map(col => {
            let val = (this as any)[col.propertyKey];

            // check if non-nullable values are null
            if ((val === null || val === undefined) && !col.isNullable) {
                throw new InvalidEntityError(`Field "${col.propertyKey}" is ${val} and is not nullable`);
            }
            // store string as a list
            if (col.isList) {
                return JSON.stringify(val);
            }

            return val;
        
        }) as string[];

        // INSERT
        if (pkValue == null) {
            

            // column names
            const colNames = cols.map(col => col.name);

            const placeholders = cols.map(_ => '?').join(', ');

            const sql = `INSERT INTO ${tableName} (${colNames.join(', ')}) VALUES ( ${placeholders} )`;
            const result = await db.runAsync(sql, ...values);
            (this as any)[pk!] = result.lastInsertRowId;
        }
        // UPDATE
        else {
            const assignments = cols.map(col => `${col.name} = ?`);
            
            const sql = `UPDATE ${tableName} SET ${assignments.join(', ')} WHERE ${pkColumn} = ?`;

            values.push(pkValue)

            await db.runAsync(sql, ...values);


        }

    }




    

}