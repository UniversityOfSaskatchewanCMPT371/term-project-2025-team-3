import "reflect-metadata";
import { Entity, ColumnMetadata, PrimaryGeneratedColumn, Column } from '../decorators';
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

function DummyDecorator() {
  return function(target: any, propertyKey: string) {
  };
}

export class TestColumn {
  @DummyDecorator()
  columnOne:string = "";
}


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
                    isNullable: false
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
                    isNullable: false
                },
                {
                    propertyKey: "columnOne",
                    name: "columnone",
                    type: "TEXT",
                    isPrimary: false,
                    isList: false,
                    isNullable: true
                },
                {
                    propertyKey: "id",
                    name: "id",
                    type: "TEXT",
                    isPrimary: false,
                    isList: true,
                    isNullable: false
                }
            ] as Array<ColumnMetadata>;



            (TestClass.prototype as any)._primaryKey = "id";


            entity(TestClass as any);

            expect(mockdb.execSync).toHaveBeenCalledWith(
                "CREATE TABLE IF NOT EXISTS testclass (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  columnone TEXT NULL,\n  id TEXT NOT NULL\n);"
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
					isNullable: false
				},
				{
					propertyKey: "uuid",
					name: "uuid",
					type: "TEXT",
					isPrimary: true,
					isNullable: false
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
					isNullable: false
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
				isNullable: false
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



	describe("Test @Column", () => {

		it("test with text column", () => {


      
      
      const keys = Reflect.getMetadataKeys(TestColumn.prototype, "columnOne");


			expect(keys).not.toEqual([]);


		});



	});







});