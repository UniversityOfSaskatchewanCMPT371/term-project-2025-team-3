import * as ExpoSqlite from "expo-sqlite";
import SQLite3 from "sqlite3";

export type Database = ExpoSqlite.SQLiteDatabase | SQLite3.Database;

export default class DatabaseController {

    private db: Database

    constructor() {
        
    }

    openDatabase(db_name: string) {
        if (process.env.NODE_ENV === "test") {
            // Use sqlite3 (Node.js) for testing
            this.db = new SQLite3.Database(":memory:", (err) => {
                if (err) {
                    console.error("Error opening in-memory SQLite database:", err.message);
                } else {
                    console.log("Connected to in-memory SQLite database.");
                }
            });
        } else {
            // Use Expo SQLite (React Native)
            this.db = ExpoSqlite.openDatabaseSync("mydatabase.db");
        }
    }



}