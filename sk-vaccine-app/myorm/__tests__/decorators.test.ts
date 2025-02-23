import "reflect-metadata";
import { Entity, ColumnMetadata, PrimaryGeneratedColumn, Column, mapTsTypeToSql, List } from '../decorators';
import BaseEntity from '../base-entity';
import { InvalidEntityError } from '@/utils/ErrorTypes';
import * as SQLite from 'expo-sqlite';


const mockdb = {
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    execSync: jest.fn(),
    getAllSync: jest.fn()
} as unknown as SQLite.SQLiteDatabase;


class TestClass extends BaseEntity {}



describe("Unit tests for myorm decorators", () => {
    BaseEntity.db = mockdb;
    beforeEach(() => {
        class TestClass extends BaseEntity {}
    });

    afterEach(() => {
        jest.clearAllMocks();
        // reset TestClass prototype attrs
        delete (TestClass.prototype as any)._columns;
        delete (TestClass.prototype as any)._tableName;
        delete (TestClass.prototype as any)._primaryKey;
    });
    describe("Test @Entity", () => {





        it("Test with one primary column", () => {

            const entity = Entity();
            (TestClass.prototype as any)._columns = [
                {
                    propertyKey: "id",
                    name: "id",
                    type: "INTEGER",
                    isPrimary: true,
                    isNullable: false,
                    isUnique: false,
                }
            ] as Array<ColumnMetadata>;
            (TestClass.prototype as any)._primaryKey = "id";


            entity(TestClass as any);

            expect(mockdb.execSync).toHaveBeenCalledWith(
                'CREATE TABLE IF NOT EXISTS testclass (\n  id INTEGER PRIMARY KEY AUTOINCREMENT\n);'
            )

        });



        it("Test with primary column and other columns", () => {

            const entity = Entity();
            (TestClass.prototype as any)._columns = [
                {
                    propertyKey: "id",
                    name: "id",
                    type: "INTEGER",
                    isPrimary: true,
                    isList: false,
                    isNullable: false,
                    isUnique: false,
                },
                {
                    propertyKey: "columnOne",
                    name: "columnone",
                    type: "TEXT",
                    isPrimary: false,
                    isList: false,
                    isNullable: true,
                    isUnique: false,
                },
                {
                    propertyKey: "columnTwo",
                    name: "columntwo",
                    type: "TEXT",
                    isPrimary: false,
                    isList: true,
                    isNullable: false,
                    isUnique: false,
                }
            ] as Array<ColumnMetadata>;



            (TestClass.prototype as any)._primaryKey = "id";


            entity(TestClass as any);

            expect(mockdb.execSync).toHaveBeenCalledWith(
                "CREATE TABLE IF NOT EXISTS testclass (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  columnone TEXT NULL,\n  columntwo TEXT NOT NULL\n);"
            );

        });

        it("Test with no columns defined", () => {
            const entity = Entity();
            // simulate no columns defined
            (TestClass.prototype as any)._columns = [];
            (TestClass.prototype as any)._primaryKey = undefined;
        
            expect(() => {
              entity(TestClass as any);
            }).toThrow(InvalidEntityError);
        });


        it("Test with multiple primary keys defined", () => {
            const entity = Entity();
            (TestClass.prototype as any)._columns = [
				{
					propertyKey: "id",
					name: "id",
					type: "INTEGER",
					isPrimary: true,
					isNullable: false,
                    isUnique: false,
				},
				{
					propertyKey: "uuid",
					name: "uuid",
					type: "TEXT",
					isPrimary: true,
					isNullable: false,
                    isUnique: false,
				}
            ];
            (TestClass.prototype as any)._primaryKey = "id";
        
            expect(() => {
              entity(TestClass as any);
            }).toThrow(InvalidEntityError);
        });


        it("Test immutable entity with different fields (should drop table)", () => {
            // make the table immutable so if the fields change it is droped 
            const entity = Entity({ immutable: true, tableName: "testclass" });
            (TestClass.prototype as any)._columns = [
				{
					propertyKey: "id",
					name: "id",
					type: "INTEGER",
					isPrimary: true,
					isNullable: false,
                    isUnique: false,
				}
            ];
            (TestClass.prototype as any)._primaryKey = "id";
            
            // simulate that the current table has different structure
            (mockdb.getAllSync as jest.Mock).mockReturnValue([
				{ name: "id", type: "INTEGER" },
				{ name: "extra", type: "TEXT" }
            ]);
            
            entity(TestClass as any);
            
            // expect that the table was dropped first, then created
            expect(mockdb.execSync).toHaveBeenCalledWith(
              "DROP TABLE IF EXISTS testclass;"
            );
            expect(mockdb.execSync).toHaveBeenCalledWith(
              'CREATE TABLE IF NOT EXISTS testclass (\n  id INTEGER PRIMARY KEY AUTOINCREMENT\n);'
            );
        });


		it("Test immutable entity with matching fields (should not drop table)", () => {
			const entity = Entity({ immutable: true, tableName: "testclass" });
			(TestClass.prototype as any)._columns = [
			  {
				propertyKey: "id",
				name: "id",
				type: "INTEGER",
				isPrimary: true,
				isNullable: false,
                isUnique: false,
			  }
			];
			(TestClass.prototype as any)._primaryKey = "id";
		
			// identical table
			(mockdb.getAllSync as jest.Mock).mockReturnValue([
			  { name: "id", type: "INTEGER" }
			]);
		
			entity(TestClass as any);
		
			// should not drop the table
			expect(mockdb.execSync).not.toHaveBeenCalledWith(
			  expect.stringContaining("DROP TABLE IF EXISTS")
			);
			expect(mockdb.execSync).toHaveBeenCalledWith(
			  'CREATE TABLE IF NOT EXISTS testclass (\n  id INTEGER PRIMARY KEY AUTOINCREMENT\n);'
			);
		});






    });



	describe("Test @Column, @PrimaryGeneratedColumn and @List decorators", () => {

		it("test with text column", () => {


            class TestColumn1 {
                @Column({tsType: String})
                columnOne: string;
            }
      
            expect((TestColumn1.prototype as any)._columns).toEqual([
                {
                    name: "columnOne",
                    type: "TEXT",
                    isList: false,
                    isPrimary: false,
                    isNullable: false,
                    propertyKey: "columnOne",
                    isUnique: false,
                }
            ])



		});
        it("throws error when neither tsType or type is provided", () => {
            expect(() => {
                class TestColumn2 {
                    @Column()
                    columnTwo: string = "";
                }
              void (TestColumn2.prototype as any)._columns;
            }).toThrow(InvalidEntityError);
        });
        
          it("test with primary column", () => {
            class TestColumn3 {
              @Column({ tsType: Number, isPrimary: true })
              id: number = 0;
            }
        
            const proto = TestColumn3.prototype as any;
            expect(proto._columns).toEqual([
                {
                    propertyKey: "id",
                    name: "id",
                    type: mapTsTypeToSql(Number),
                    isList: false,
                    isPrimary: true,
                    isNullable: false,
                    isUnique: false,
                },
            ]);
            expect(proto._primaryKey).toEqual("id");
        });


        it("test with @PrimaryGeneratedColumn", () => {
            class TestColumn7 {
              @PrimaryGeneratedColumn()
              id: number = 0;
            }
        
            const proto = TestColumn7.prototype as any;
            expect(proto._columns).toEqual([
                {
                    propertyKey: "id",
                    name: "id",
                    type: "INTEGER",
                    isList: false,
                    isPrimary: true,
                    isNullable: false,
                    isUnique: false,
                },
            ]);
            expect(proto._primaryKey).toEqual("id");
        });
        
          it("test with list column", () => {
            class TestColumn4 {
                @Column({ tsType: Array, isList: true })
                tags: string[] = [];
            }
        
            const proto = TestColumn4.prototype as any;
            expect(proto._columns).toEqual([
                {
                    propertyKey: "tags",
                    name: "tags",
                    type: "TEXT",
                    isList: true,
                    isPrimary: false,
                    isNullable: false,
                    isUnique: false,
                },
            ]);
        });

        it("test with @List", () => {
            class TestColumn8 {
                @List()
                tags: string[] = [];
            }
        
            const proto = TestColumn8.prototype as any;
            expect(proto._columns).toEqual([
                {
                    propertyKey: "tags",
                    name: "tags",
                    type: "TEXT",
                    isList: true,
                    isPrimary: false,
                    isNullable: false,
                    isUnique: false,
                },
            ]);
        });
        
          it("test with nullable column", () => {
            class TestColumn5 {
                @Column({ tsType: Boolean, isNullable: true })
                isActive: boolean = false;
            }
        
            const proto = TestColumn5.prototype as any;
            expect(proto._columns).toEqual([
                {
                    propertyKey: "isActive",
                    name: "isActive",
                    type: mapTsTypeToSql(Boolean),
                    isList: false,
                    isPrimary: false,
                    isNullable: true,
                    isUnique: false,
                },
            ]);
        });
        
        it("test with custom name", () => {
            class TestColumn6 {
                @Column({ tsType: Number, name: "custom_id" })
                id: number = 0;
            }
        
            const proto = TestColumn6.prototype as any;
            expect(proto._columns).toEqual([
                {
                    propertyKey: "id",
                    name: "custom_id",
                    type: mapTsTypeToSql(Number),
                    isList: false,
                    isPrimary: false,
                    isNullable: false,
                    isUnique: false,
                },
            ]);
        });


	});







});