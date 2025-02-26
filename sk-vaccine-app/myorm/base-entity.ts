import * as SQLite from 'expo-sqlite';
import { ColumnMetadata, EntityConstructor, EntityPrototype } from './decorators';
import { InvalidEntityError } from '@/utils/ErrorTypes';
import assert from 'assert';


// The function signatures is based off of the code in typeorm
// repository: https://github.com/typeorm/typeorm/blob/master/src/repository/BaseEntity.ts
// this is the part I stole:
// funName<T extends BaseEntity>(
//     this: { new (): T } & typeof BaseEntity,
// ): void {
    

// NOTE: this is not an abstract class because i want the `db` attribute
// to be taken from the `BaseEntity` class, so all entities share the same
// database. If it is abstract i cannot do that
/**
 * Core class for all db entities. Db entities
 * must extend this class.
 */
export default class BaseEntity {


    /** 
     * An sqlite database connection.
     */
    static db: SQLite.SQLiteDatabase;

    /**
     * Finds and returns all records of the current entity.
     * @preconditions This must be called from a class that extends `BaseEntity`,
     * has one primary attribute, and the class has an `Entity` decorator. The mysql
     * database must also be initialized using the hook `useInitDataSource`.
     * @template T The type of the entity.
     * @returns An array of entities.
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     */
    static async find<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
    ): Promise<T[]> {

        // ensure prototype is properly defined
        assert(this.verifyPrototype())
        
        const db = BaseEntity.db;



        const prototype = this.prototype as EntityPrototype;
        

        const result = await db.getAllAsync(`SELECT * FROM ${prototype._tableName}`);
        


        return this.convertToObj<T>(result);;
    }


    /**
     * A helper function that takes the object returned by sqlite's `SQLiteDatabase.getAllAsync` 
     * and turns it into an object of type `T`.
     * @preconditions This must be called from a class that extends `BaseEntity`,
     * has one primary attribute, and the class has an `Entity` decorator. The mysql
     * database must also be initialized using the hook `useInitDataSource`.
     * @param queryResult mysql query result that contains an array of objects that
     *  correspond to the table defined in the class that calls this function
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





                // verify that the object contains the proper rows
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
     * Executes a query that returns a list of objects of the type this
     * is called with.
     * It automatically replaces `$table` with the entity’s table name.
     * @preconditions This must be called from a class that extends `BaseEntity`,
     * has one primary attribute, and the class has an `Entity` decorator. The mysql
     * database must also be initialized using the hook `useInitDataSource`.
     * @template T The type of the entity.
     * @param query A valid SQL query string. Use `$table` within the query
     * to reference this entity's table name. Needs to return a list of objects
     * @param params Additional parameters for the query (optional).
     * @returns An array of entities resulting from the query.
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     *
     * @example
     * // The table name is "employees"
     * const results = await Employee.query(
     *    "SELECT * FROM $table WHERE salary > ?",
     *    100000
     * );
     * // This runs:
     * //   SELECT * FROM employees WHERE salary > 100000
     */
    static async queryObjs<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
        query: string,
        ...params: any[]
    ): Promise<T[]> {
        const db = this.db;
        const prototype = this.prototype as EntityPrototype;
        assert(this.verifyPrototype())
    
        const tableName = prototype._tableName;
        const finalQuery = query.replace(/\$table/g, tableName!);
    
        const result = await db.getAllAsync(finalQuery, ...params);
    
        // Convert rows to entity instances
        return this.convertToObj<T>(result);
    }


    /**
     * Executes a query.
     * It automatically replaces `$table` with the entity’s table name.
     *
     * @template T The type of the entity.
     * @param query A valid SQL query string. Use `$table` within the query
     * to reference this entity's table name. Needs to return a list of objects
     * @param params Additional parameters for the query (optional).
     * @returns An the result of the query the same way as the expo-sqlite database does
     * see @link https://docs.expo.dev/versions/latest/sdk/sqlite/. 
     * If, after reading the documentation, you are still unsure what kind of object will be 
     * returned, don't worry, that is normal. Their documentation is terrible.
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     * @effects modifys the sqlite database based on the given `query`
     *
     * @example
     * // The table name is "employees"
     * const results = await Employee.query(
     *    "SELECT * FROM $table WHERE salary > ?",
     *    100000
     * );
     * // This runs:
     * //   SELECT * FROM employees WHERE salary > 100000
     */
    static async query<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
        query: string,
        ...params: any[]
    ): Promise<any>{
        const db = this.db;
        const prototype = this.prototype as EntityPrototype;
        assert(this.verifyPrototype())
    
        const tableName = prototype._tableName;
        const finalQuery = query.replace(/\$table/g, tableName!);
    
        const result = await db.getAllAsync(finalQuery, ...params);
    
        // Convert rows to entity instances
        return result;
    }




    /**
     * Get the number of entities in the table.
     * @preconditions This must be called from a class that extends `BaseEntity`,
     * has one primary attribute, and the class has an `Entity` decorator. The mysql
     * database must also be initialized using the hook `useInitDataSource`.
     * @template T The type of the entity.
     * @returns The number of entities in the table.
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     */
    static async count<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
    ): Promise<number> {
        const prototype = this.prototype as EntityPrototype;
        // ensure prototype is properly defined
        assert(this.verifyPrototype())
        const db = this.db;
        const result = await db.getFirstAsync(`SELECT COUNT(*) as count FROM ${prototype._tableName}`) as any;
        return result.count;
    }


    /**
     * Clears all entities from the table.
     * @preconditions This must be called from a class that extends `BaseEntity`,
     * has one primary attribute, and the class has an `Entity` decorator. The mysql
     * database must also be initialized using the hook `useInitDataSource`.
     * @template T The type of the entity.
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     * @effects Deletes all of the rows in the database.
     */
    static async clear<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
    ): Promise<void> {
        // ensure prototype is properly defined
        assert(this.verifyPrototype())

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
     * @preconditions This must be called from a class that extends `BaseEntity`,
     * has one primary attribute, and the class has an `Entity` decorator. The mysql
     * database must also be initialized using the hook `useInitDataSource`.
     * @template T The type of the entity.
     * @returns A list of column data.
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     */
    static getColumns<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
    ): Promise<Array<ColumnMetadata>> {
        const prototype = this.prototype as EntityPrototype;


        // ensure prototype is properly defined
        assert(this.verifyPrototype())


        return (this.prototype as any)._columns
    }


    /**
     * Checks if the prototype of the current class contains the information needed to
     * set up a table. 
     * @returns 1 on success
     * @throws {InvalidEntityError} If the entity prototype is not properly defined.
     */
    private static verifyPrototype<T extends BaseEntity>(
        this: { new (): T } & typeof BaseEntity,
    ): number {
        const prototype = this.prototype as EntityPrototype;

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



        return 1;
    }

    /**
     * Saves the current object to the database.
     * @preconditions All columns that are not nullable must contain a value. 
     * This must be called from a class that extends `BaseEntity`,
     * has one primary attribute, and the class has an `Entity` decorator. The mysql
     * database must also be initialized using the hook `useInitDataSource`.
     * @throws {InvalidEntityError} If a required field is empty or
     *      the entity prototype is not properly defined.
     * @effects Adds a row to the database with the objects data.
     */
    async save(): Promise<void> {


        // ensure prototype is properly defined
        assert((this.constructor as typeof BaseEntity).verifyPrototype());



        const db = BaseEntity.db;

        const constructor = this.constructor as EntityConstructor;
        const prototype = constructor.prototype;

        const tableName = prototype._tableName;
        const pk = prototype._primaryKey;
        const columns = prototype._columns;


        const pkValue = (this as any)[pk!];


        // columns without primary key
        const cols = columns!.filter(col => !col.isPrimary);


        const pkColumn = columns!.find(col => col.isPrimary)!;

        
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


        const {recordExists} = await db.getFirstAsync("SELECT EXISTS(SELECT 1 FROM myTable WHERE id = ?) as recordExists;") as any;
        // INSERT
        if (!recordExists) {
            
            // if id is defined insert it
            if (pkValue !== undefined && pkValue !== null) {
                cols.push(pkColumn);
                values.push(pkValue);
            }

            const colNames = cols.map(col => col.name);



            const placeholders = cols.map(_ => '?').join(', ');
            const sql = `INSERT INTO ${tableName} ( ${colNames.join(', ')} ) VALUES ( ${placeholders} )`;
            const result = await db.runAsync(sql, ...values);
            (this as any)[pk!] = result.lastInsertRowId;
        }
        // UPDATE
        else {
            const assignments = cols.map(col => `${col.name} = ?`);
            
            const sql = `UPDATE ${tableName} SET ${assignments.join(', ')} WHERE ${pkColumn.name} = ?`;

            values.push(pkValue)

            await db.runAsync(sql, ...values);


        }

    }




    

}