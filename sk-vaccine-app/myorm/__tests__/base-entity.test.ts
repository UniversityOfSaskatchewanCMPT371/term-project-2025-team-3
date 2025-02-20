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



    







});