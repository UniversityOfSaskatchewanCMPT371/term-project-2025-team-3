import { Entity, PrimaryKey } from '../decorators';
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
    beforeEach(() => {
        class TestClass extends BaseEntity {}
        TestClass.db = mockdb;
    });

    afterEach(() => {
        jest.clearAllMocks();
        
    });
    describe("Test @Entity", () => {





        it("Test with one primary column", () => {
            
            const entity = Entity();
            const primaryKey = PrimaryKey();
            primaryKey(TestClass, "id");
            entity(TestClass);

            expect(mockdb.execSync).toHaveBeenCalledWith(
                'CREATE TABLE IF NOT EXISTS testclass (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n\n);'
            )

        })




    });


});