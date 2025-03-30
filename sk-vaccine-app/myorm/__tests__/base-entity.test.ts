jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn().mockReturnValue({
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
    execSync: jest.fn(),
    getAllSync: jest.fn(),
  } as unknown as SQLite.SQLiteDatabase),
}));
import { InvalidEntityError } from "@/utils/ErrorTypes";
import BaseEntity from "../base-entity";
import * as SQLite from 'expo-sqlite';
import { ColumnMetadata, mapTsTypeToSql } from "../decorators";


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



    describe("Unit tests for convertToObj", () => {
        it("test with simple object", () => {

            class Test extends BaseEntity {
                id: number;
                columnOne: string;
                constructor(id: number, columnOne: string) {
                    super();
                    this.id = id;
                    this.columnOne = columnOne;
                }
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


            const queryResult = [
                {
                    "id": 1234,
                    "columnone": "hello"
                },
                {
                    "id": 12345,
                    "columnone": "world"
                }
            ];
            const expectedResults = [
                new Test(1234, "hello"),
                new Test(12345, "world")
            ]


            

            const result = (Test as any).convertToObj(
                queryResult
            );

            expect(result).toEqual(
                expectedResults
            )
            



        });

        it("should throw an error if the `queryResult` does not match the structure of the Class", () => {
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
                    isNullable: false
                }
            ];
    
            // "columnone" is missing in the result
            const queryResult = [
                {
                    id: 1234
                }
            ];
    
            expect(() => {
                (Test as any).convertToObj(queryResult);
            }).toThrow(InvalidEntityError);
        });
    
        it("stores arrays correctly", () => {
            class Test extends BaseEntity {
                id: number;
                tags: string[];
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
                    propertyKey: "tags",
                    name: "tags",
                    type: "TEXT",
                    isPrimary: false,
                    isList: true,   
                    isNullable: true
                }
            ];
    
            const queryResult = [
                {
                    id: 1,
                    tags: '["tag1","tag2"]'
                },
                {
                    id: 2,
                    tags: '["onlyOne"]'
                }
            ];
    
            const result = (Test as any).convertToObj(queryResult);
    
            expect(result[0].id).toBe(1);
            expect(result[0].tags).toEqual(["tag1", "tag2"]);
    
            expect(result[1].id).toBe(2);
            expect(result[1].tags).toEqual(["onlyOne"]);
        });
    
        it("should return an empty array if queryResult is empty", () => {
            class Test extends BaseEntity {
                id: number;
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
                }
            ];
    
            // Empty query results
            const queryResult: any[] = [];
    
            const result = (Test as any).convertToObj(queryResult);
            expect(result).toEqual([]);
        });
    
        it("should handle multiple rows correctly", () => {
            class Test extends BaseEntity {
                id: number;
                value: string;
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
                    propertyKey: "value",
                    name: "value",
                    type: "TEXT",
                    isPrimary: false,
                    isList: false,
                    isNullable: true
                }
            ];
    
            const queryResult = [
                { id: 1, value: "A" },
                { id: 2, value: "B" },
                { id: 3, value: "C" }
            ];
    
            const result = (Test as any).convertToObj(queryResult);
    
            expect(result.length).toBe(3);
            expect(result[0].id).toBe(1);
            expect(result[0].value).toBe("A");
            expect(result[1].id).toBe(2);
            expect(result[1].value).toBe("B");
            expect(result[2].id).toBe(3);
            expect(result[2].value).toBe("C");
        });
        


    });

    // this mostly just tests convertToObj so it does not need many tests
    describe("Unit tests for find", () => {
        it("test with list column", async () => {
            (mockdb.getAllAsync as jest.Mock).mockResolvedValue([
                { id: 1, list: JSON.stringify(["A"]) },
                { id: 2, list: JSON.stringify(["A", "B"]) }
            ]);
    
            class Test extends BaseEntity {
                id: number;
                list: string[];
            }
    
            (Test.prototype as any)._tableName = "test_list";
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
                    propertyKey: "list",
                    name: "list",
                    type: "TEXT",
                    isPrimary: false,
                    isList: true,
                    isNullable: false
                }
            ];
    
            const result = await Test.find();
    
            expect(result.length).toBe(2);
    
            // row 1
            expect(result[0].id).toBe(1);
            expect(result[0].list).toEqual(["A"]);
    
            // row 2
            expect(result[1].id).toBe(2);
            expect(result[1].list).toEqual(["A", "B"]);
        });
    
        it("test with string column", async () => {
            (mockdb.getAllAsync as jest.Mock).mockResolvedValue([
                { id: 10, value: "Hello" },
                { id: 20, value: "World" }
            ]);
    
            class Test extends BaseEntity {
                id: number;
                value: string;
            }
    
            (Test.prototype as any)._tableName = "test_string";
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
                    propertyKey: "value",
                    name: "value",
                    type: "TEXT",
                    isPrimary: false,
                    isList: false,
                    isNullable: false
                }
            ];
    
            const result = await Test.find();
    
            expect(result.length).toBe(2);
    
            // row 1
            expect(result[0].id).toBe(10);
            expect(result[0].value).toBe("Hello");
    
            // row 2
            expect(result[1].id).toBe(20);
            expect(result[1].value).toBe("World");
        });
    
        it("test with number columns", async () => {
            (mockdb.getAllAsync as jest.Mock).mockResolvedValue([
                { id: 100, score: 50 },
                { id: 200, score: 75 }
            ]);
    
            class Test extends BaseEntity {
                id: number;
                score: number;
            }
    
            (Test.prototype as any)._tableName = "test_numeric";
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
                    propertyKey: "score",
                    name: "score",
                    type: mapTsTypeToSql(Number),
                    isPrimary: false,
                    isList: false,
                    isNullable: false
                }
            ];
    
            const result = await Test.find();
    
            expect(result.length).toBe(2);
    
            // row 1
            expect(result[0].id).toBe(100);
            expect(result[0].score).toBe(50);
    
            // row 2
            expect(result[1].id).toBe(200);
            expect(result[1].score).toBe(75);
        });
    
        it("test with nullable columns", async () => {
            (mockdb.getAllAsync as jest.Mock).mockResolvedValue([
                { id: 999, nullable: 123 },
                { id: 1000, nullable: null }
            ]);
    
            class Test extends BaseEntity {
                id: number;
                nullable: number | null;
            }
    
            (Test.prototype as any)._tableName = "test_nullable";
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
                    propertyKey: "nullable",
                    name: "nullable",
                    type: mapTsTypeToSql(Number),
                    isPrimary: false,
                    isList: false,
                    isNullable: true
                }
            ];
    
            const result = await Test.find();
    
            expect(result.length).toBe(2);
    
            // row 1
            expect(result[0].id).toBe(999);
            expect(result[0].nullable).toBe(123);
    
            // row 2
            expect(result[1].id).toBe(1000);
            expect(result[1].nullable).toBeNull();
        });



        it("test with empty result", async () => {
            (mockdb.getAllAsync as jest.Mock).mockResolvedValue([]);
        
            class Test extends BaseEntity {
                id: number;
                value: string;
            }
        
            (Test.prototype as any)._tableName = "test_empty";
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
                    propertyKey: "value",
                    name: "value",
                    type: "TEXT",
                    isPrimary: false,
                    isList: false,
                    isNullable: false
                }
            ];
        
            const result = await Test.find();
        
            expect(result).toEqual([]);
        });
    });



    
    describe("Unit tests for queryObjs method", () => {

        class TestEntity extends BaseEntity {
            id: number;
            name: string;
        }




        beforeEach(() => {
            jest.clearAllMocks();
            
            (TestEntity.prototype as any)._tableName = "test_table";
            (TestEntity.prototype as any)._primaryKey = "id";
            (TestEntity.prototype as any)._columns = [
                {
                    propertyKey: "id",
                    name: "id",
                    type: "INTEGER",
                    isPrimary: true,
                    isList: false,
                    isNullable: false
                },
                {
                    propertyKey: "name",
                    name: "name",
                    type: "TEXT",
                    isPrimary: false,
                    isList: false,
                    isNullable: false
                }
            ];
        });
    
        it("should replace $table with the correct table name and return entity objects", async () => {
            (mockdb.getAllAsync as jest.Mock).mockResolvedValue([
                { id: 1, name: "Alice" },
                { id: 2, name: "Bob" }
            ]);
    
            const results = await TestEntity.queryObjs(
                "SELECT * FROM $table WHERE name LIKE ?",
                "A%"
            );
    
            expect(mockdb.getAllAsync).toHaveBeenCalledWith(
                "SELECT * FROM test_table WHERE name LIKE ?",
                "A%"
            );
            expect(results.length).toBe(2);
            expect(results[0].id).toBe(1);
            expect(results[0].name).toBe("Alice");
            expect(results[1].id).toBe(2);
            expect(results[1].name).toBe("Bob");
        });
    
        it("should return an empty array if no rows match", async () => {
            (mockdb.getAllAsync as jest.Mock).mockResolvedValue([]);
    
            const results = await TestEntity.queryObjs("SELECT * FROM $table");
    
            expect(results).toEqual([]);
            expect(mockdb.getAllAsync).toHaveBeenCalledWith("SELECT * FROM test_table");
        });
    
        it("should pass multiple parameters correctly", async () => {
            (mockdb.getAllAsync as jest.Mock).mockResolvedValue([{ id: 999, name: "Testy" }]);
    
            const results = await TestEntity.queryObjs(
                "SELECT * FROM $table WHERE id > ? AND name = ?",
                100,
                "Testy"
            );
    
            expect(mockdb.getAllAsync).toHaveBeenCalledWith(
                "SELECT * FROM test_table WHERE id > ? AND name = ?",
                100,
                "Testy"
            );
            expect(results[0].id).toBe(999);
            expect(results[0].name).toBe("Testy");
        });
    
        it("should throw InvalidEntityError if prototype is missing a table name", async () => {
            (TestEntity.prototype as any)._tableName = undefined;
    
            await expect(TestEntity.queryObjs("SELECT * FROM $table")).rejects.toThrow(
                InvalidEntityError
            );
            expect(mockdb.getAllAsync).not.toHaveBeenCalled();
        });
    });
    
    describe("Unit tests for query method", () => {


        class TestEntity extends BaseEntity {
            id: number;
            name: string;
        }



        beforeEach(() => {
            jest.clearAllMocks();
            (TestEntity.prototype as any)._tableName = "test_table";
            (TestEntity.prototype as any)._primaryKey = "id";
            (TestEntity.prototype as any)._columns = [
                {
                    propertyKey: "id",
                    name: "id",
                    type: "INTEGER",
                    isPrimary: true,
                    isList: false,
                    isNullable: false
                },
                {
                    propertyKey: "name",
                    name: "name",
                    type: "TEXT",
                    isPrimary: false,
                    isList: false,
                    isNullable: false
                }
            ];
        });
    
        it("should replace $table and return result from the database", async () => {
            (mockdb.getAllAsync as jest.Mock).mockResolvedValue([
                { id: 10, name: "RawName" }
            ]);
    
            const result = await TestEntity.query("SELECT * FROM $table WHERE id = ?", 10);
    
            expect(mockdb.getAllAsync).toHaveBeenCalledWith(
                "SELECT * FROM test_table WHERE id = ?",
                10
            );
            expect(result).toEqual([{ id: 10, name: "RawName" }]);
        });
    
        it("should handle no matching rows and return an empty array", async () => {
            (mockdb.getAllAsync as jest.Mock).mockResolvedValue([]);
    
            const result = await TestEntity.query("SELECT * FROM $table WHERE id = ?", 999);
    
            expect(mockdb.getAllAsync).toHaveBeenCalledWith(
                "SELECT * FROM test_table WHERE id = ?",
                999
            );
            expect(result).toEqual([]);
        });
    
        it("should pass multiple parameters and return data", async () => {
            (mockdb.getAllAsync as jest.Mock).mockResolvedValue([
                { id: 101, name: "ParamTester" }
            ]);
    
            const result = await TestEntity.query(
                "SELECT * FROM $table WHERE id > ? AND name = ?",
                100,
                "ParamTester"
            );
    
            expect(mockdb.getAllAsync).toHaveBeenCalledWith(
                "SELECT * FROM test_table WHERE id > ? AND name = ?",
                100,
                "ParamTester"
            );
            expect(result).toEqual([{ id: 101, name: "ParamTester" }]);
        });
    
        it("should throw InvalidEntityError if prototype is not complete", async () => {
            (TestEntity.prototype as any)._tableName = undefined;
    
            await expect(TestEntity.query("SELECT * FROM $table")).rejects.toThrow(
                InvalidEntityError
            );
            expect(mockdb.getAllAsync).not.toHaveBeenCalled();
        });
    });
    

    describe("Unit tests for count", () => {


        it("should return the correct count when the table has records", async () => {
            (mockdb.getFirstAsync as jest.Mock).mockResolvedValue({ count: 5 });
    
            class Test extends BaseEntity {}
    
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
                }
            ];
    
            const count = await Test.count();
            expect(count).toBe(5);
            expect(mockdb.getFirstAsync).toHaveBeenCalledWith("SELECT COUNT(*) as count FROM test");
        });
    
        it("should return 0 when the table is empty", async () => {
            (mockdb.getFirstAsync as jest.Mock).mockResolvedValue({ count: 0 });
    
            class Test extends BaseEntity {}
    
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
                }
            ];
    
            const count = await Test.count();
            expect(count).toBe(0);
            expect(mockdb.getFirstAsync).toHaveBeenCalledWith("SELECT COUNT(*) as count FROM test");
        });
    
        it("should throw InvalidEntityError if the prototype is not defined", async () => {
            class Test extends BaseEntity {}
    
            (Test.prototype as any)._tableName = undefined;
            (Test.prototype as any)._primaryKey = "id";
            (Test.prototype as any)._columns = [];
    
            await expect(Test.count()).rejects.toThrow(InvalidEntityError);
            expect(mockdb.getFirstAsync).not.toHaveBeenCalled();
        });
    

        describe("Unit tests for clear", () => {
            it("should delete all records from the table", async () => {
                (mockdb.execAsync as jest.Mock).mockResolvedValue(undefined);
        
                class Test extends BaseEntity {}

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
                    }
                ];

        
                (Test.prototype as any)._tableName = "test";
        
                await Test.clear();
        
                expect(mockdb.execAsync).toHaveBeenCalledWith("DELETE FROM test");
            });
        
            it("should throw an error if _tableName is undefined", async () => {
                class Test extends BaseEntity {}
        
                (Test.prototype as any)._tableName = undefined;
        
                await expect(Test.clear()).rejects.toThrow(InvalidEntityError);
            });
        });

        describe("Unit tests for getColumns", () => {
            it("should return a list of column names", async () => {
                class Test extends BaseEntity {}
        
                (Test.prototype as any)._tableName = "test";
                (Test.prototype as any)._primaryKey = "id";
                (Test.prototype as any)._columns = [
                    { propertyKey: "id", name: "id", type: "INTEGER", isPrimary: true, isList: false, isNullable: false },
                    { propertyKey: "columnOne", name: "column_one", type: "TEXT", isPrimary: false, isList: false, isNullable: true },
                    { propertyKey: "columnTwo", name: "column_two", type: "TEXT", isPrimary: false, isList: true, isNullable: false }
                ];
        
                const columns = await Test.getColumns();
        
                expect(columns).toEqual([
                    { propertyKey: "id", name: "id", type: "INTEGER", isPrimary: true, isList: false, isNullable: false },
                    { propertyKey: "columnOne", name: "column_one", type: "TEXT", isPrimary: false, isList: false, isNullable: true },
                    { propertyKey: "columnTwo", name: "column_two", type: "TEXT", isPrimary: false, isList: true, isNullable: false }
                ]);
            });
            
            it("should return an empty array when there are no columns", async () => {
                class Test extends BaseEntity {}
        
                (Test.prototype as any)._tableName = "test";
                (Test.prototype as any)._primaryKey = "id";
                (Test.prototype as any)._columns = [];
        
                const columns = await Test.getColumns();
        
                expect(columns).toEqual([]);
            });
        
            it("should throw InvalidEntityError if the prototype is not defined", async () => {
                class Test extends BaseEntity {}
        
                (Test.prototype as any)._tableName = undefined;
                (Test.prototype as any)._columns = undefined;
        
                expect(() => {
                    Test.getColumns();
                }).toThrow(InvalidEntityError);
            });
        


        });

    });




});