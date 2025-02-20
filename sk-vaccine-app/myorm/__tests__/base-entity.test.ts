import { InvalidEntityError } from "@/utils/ErrorTypes";
import BaseEntity from "../base-entity";
import * as SQLite from 'expo-sqlite';
import { ColumnMetadata, mapJsTypeToSql } from "../decorators";


const mockdb = {
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    execSync: jest.fn(),
    getAllSync: jest.fn(),
    runAsync: jest.fn(),
} as unknown as SQLite.SQLiteDatabase;



describe("Unit tests for BaseEntity", () => {
    beforeEach(() => {
        BaseEntity.db = mockdb;
        jest.clearAllMocks();
    });
    describe("Unit tests for verifyPrototype", () => {


        it("test with undefined _columns", () => {
            class Test extends BaseEntity {}
            (Test.prototype as any)._tableName = "test";
            (Test.prototype as any)._primaryKey = "id";
            (Test.prototype as any)._columns = undefined;
    
            expect( () => {
                (Test as any).verifyPrototype()
            }).toThrow(InvalidEntityError);
        });

        it("test with undefined _primaryKey", () => {
            class Test extends BaseEntity {}
            (Test.prototype as any)._tableName = "test";
            (Test.prototype as any)._primaryKey = undefined;
            (Test.prototype as any)._columns = [];
    
            expect( () => {
                (Test as any).verifyPrototype()
            }).toThrow(InvalidEntityError);
        });


        it("test with undefined _tableName", () => {
            class Test extends BaseEntity {}
            (Test.prototype as any)._tableName = undefined;
            (Test.prototype as any)._primaryKey = "id";
            (Test.prototype as any)._columns = [];
    
            expect( () => {
                (Test as any).verifyPrototype()
            }).toThrow(InvalidEntityError);
        });

        it("test with all columns defined", () => {
            class Test extends BaseEntity {}
            (Test.prototype as any)._tableName = "test";
            (Test.prototype as any)._primaryKey = "id";
            (Test.prototype as any)._columns = [];
    
            expect( () => {
                (Test as any).verifyPrototype()
            }).not.toThrow(InvalidEntityError);
        });



    });




    describe("Unit tests for save", () => {


        it ("test insert with string column", async () => {


            (mockdb.getFirstAsync as jest.Mock).mockResolvedValue(
                {
                    recordExists: 0
                }
            );
            (mockdb.runAsync as jest.Mock).mockResolvedValue(
                {
                    lastInsertRowId: 1
                }
            );
            class Test extends BaseEntity {
                id: number;
                columnOne: string;
                columnTwo: Array<string>;

            }
            
            (Test.prototype as any)._tableName = "test";
            (Test.prototype as any)._primaryKey = "id";
            (Test.prototype as any)._columns = [
                {
                    propertyKey: "id",
                    name: "id",
                    type: "INTEGER",
                    isList: false,
                    isPrimary: true,
                    isNullable: true,
                },
                {
                    propertyKey: "columnOne",
                    name: "columnone",
                    type: "TEXT",
                    isPrimary: false,
                    isList: false,
                    isNullable: true
                },
            ];


            const test = new Test();
            test.columnOne = "hello"

            await test.save();
            expect(mockdb.runAsync).toHaveBeenCalledWith(
                "INSERT INTO test ( columnone ) VALUES ( ? )", "hello"
            );



        });


        it ("test insert with list column", async () => {

            (mockdb.getFirstAsync as jest.Mock).mockResolvedValue(
                {
                    recordExists: 0
                }
            );
            (mockdb.runAsync as jest.Mock).mockResolvedValue(
                {
                    lastInsertRowId: 1
                }
            );

            class Test extends BaseEntity {
                id: number;
                columnOne: Array<string>;

            }
            (Test.prototype as any)._tableName = "test";
            (Test.prototype as any)._primaryKey = "id";
            (Test.prototype as any)._columns = [
                {
                    propertyKey: "id",
                    name: "id",
                    type: "INTEGER",
                    isList: false,
                    isPrimary: true,
                    isNullable: true,
                },
                {
                    propertyKey: "columnOne",
                    name: "columnone",
                    type: "TEXT",
                    isPrimary: false,
                    isList: true,
                    isNullable: true
                },

            ]; 


            const test = new Test();

            test.columnOne = ["foo", "bar"];

            await test.save();


            expect((mockdb.runAsync as jest.Mock)).toHaveBeenCalledWith(
                `INSERT INTO test ( columnone ) VALUES ( ? )`, 
                JSON.stringify(test.columnOne)
            );


        });

        it("test insert with user defined primary key", async () => {
            (mockdb.getFirstAsync as jest.Mock).mockResolvedValue({
                recordExists: 0
            });
            (mockdb.runAsync as jest.Mock).mockResolvedValue({
                lastInsertRowId: 123
            });
    
            class Test extends BaseEntity {
                id: number;
                columnOne: string;
            }
    
            (Test.prototype as any)._tableName = "test";
            (Test.prototype as any)._primaryKey = "id";
            (Test.prototype as any)._columns = [
                {
                    propertyKey: "id",
                    name: "id",
                    type: "INTEGER",
                    isPrimary: true,
                    isList: false,
                    isNullable: true
                },
                {
                    propertyKey: "columnOne",
                    name: "columnone",
                    type: "TEXT",
                    isPrimary: false,
                    isList: false,
                    isNullable: true
                }
            ];
    
            const test = new Test();
            test.id = 123;
            test.columnOne = "foo";
    
            await test.save();
    
            expect(mockdb.runAsync).toHaveBeenCalledWith(
                "INSERT INTO test ( columnone, id ) VALUES ( ?, ? )",
                "foo",
                123
            );
    
        });
    
        it("test update of existing record", async () => {
            (mockdb.getFirstAsync as jest.Mock).mockResolvedValue({
                recordExists: 1
            });
            (mockdb.runAsync as jest.Mock).mockResolvedValue({});
    
            class Test extends BaseEntity {
                id: number;
                columnOne: string;
            }
    
            (Test.prototype as any)._tableName = "test";
            (Test.prototype as any)._primaryKey = "id";
            (Test.prototype as any)._columns = [
                {
                    propertyKey: "id",
                    name: "id",
                    type: "INTEGER",
                    isPrimary: true,
                    isList: false,
                    isNullable: false
                },
                {
                    propertyKey: "columnOne",
                    name: "columnone",
                    type: "TEXT",
                    isPrimary: false,
                    isList: false,
                    isNullable: true
                }
            ];
    
            const test = new Test();
            test.id = 999;
            test.columnOne = "updated value";
    
            await test.save();
    
            expect(mockdb.runAsync).toHaveBeenCalledWith(
                "UPDATE test SET columnone = ? WHERE id = ?",
                "updated value",
                999
            );
        });
    
        it("test saving entity with non-nullable column with undefined value", async () => {
            (mockdb.getFirstAsync as jest.Mock).mockResolvedValue({
                recordExists: 0
            });
    
            class Test extends BaseEntity {
                id: number;
                columnNotNull: string;
            }
    
            (Test.prototype as any)._tableName = "test";
            (Test.prototype as any)._primaryKey = "id";
            (Test.prototype as any)._columns = [
                {
                    propertyKey: "id",
                    name: "id",
                    type: "INTEGER",
                    isPrimary: true,
                    isList: false,
                    isNullable: true
                },
                {
                    propertyKey: "columnNotNull",
                    name: "columnnotnull",
                    type: "TEXT",
                    isPrimary: false,
                    isList: false,
                    isNullable: false
                }
            ];
    
            const test = new Test();
    
            await expect(test.save()).rejects.toThrow(InvalidEntityError);
    
            expect(mockdb.runAsync).not.toHaveBeenCalled();
        });
    });



});