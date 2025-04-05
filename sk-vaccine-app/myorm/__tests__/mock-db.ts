import { promisify } from "util";
import sqlite3 from "sqlite3";
import * as SQLite from "expo-sqlite";

/**
 * Setup for a NodeJS based SQLite instance
 *
 * This allows for testing SQL queries and function calls to the ORM
 * without the need for the emulator and Expo application to be running
 *
 * Each function is replaced with an sqlite3 equivalent and return values
 * are formatted to meet expectations of regular implementation.
 *
 * The database is stored in memory.
 *
 *
 */
const sqliteDb = new sqlite3.Database(":memory:"); // Create a new temporary database in memory

const allAsync = (...args: [string] | [string, any[]]) => {
  if (args.length === 1) {
    // If no parameters are provided, run query without parameters
    return promisify(
      (query: string, callback: (err: Error | null, rows: any[]) => void) => {
        sqliteDb.all(query, callback);
      }
    )(args[0]);
  } else {
    // If parameters are provided, run query with parameters
    return promisify(
      (
        query: string,
        params: any[],
        callback: (err: Error | null, rows: any[]) => void
      ) => {
        sqliteDb.all(query, params, callback);
      }
    )(args[0], args[1]);
  }
};

const runAsync = (sql: string, ...params: any[]) => {
  if (params.length === 0) {
    // If no parameters are provided, run query without parameters
    return promisify(
      (query: string, callback: (err: Error | null, rows: any[]) => void) => {
        sqliteDb.run(query, callback); // Executes the query with no parameters
      }
    )(sql);
  } else {
    // If parameters are provided, run query with parameters
    return promisify(
      (
        query: string,
        params: any[],
        callback: (
          err: Error | null,
          result: { lastInsertRowId: number; changes: number }
        ) => void
      ) => {
        // Run the query with the provided parameters
        sqliteDb.run(
          query,
          params,
          (
            err: Error | null,
            result: {
              changes: number;
              lastInsertRowId: number;
            }
          ) => {
            if (err) {
              throw new Error(
                `Entity: callback failed in runAsync test function: ${err}`
              );
            } else {
              // After the query completes, retrieve the last insert ID
              sqliteDb.get(
                "SELECT last_insert_rowid() AS id;",
                (
                  err: any,
                  row: {
                    id: number;
                  }
                ) => {
                  if (err) {
                    throw new Error(
                      "Entity: callback failed in runAsync test function"
                    );
                  } else {
                    // Return the result including the lastInsertRowId
                    callback(null, {
                      ...result,
                      lastInsertRowId: row?.id,
                    });
                  }
                }
              );
            }
          }
        );
      }
    )(sql, params);
  }
};

const getAsync = promisify(sqliteDb.get).bind(sqliteDb);
const execAsync = promisify(sqliteDb.exec).bind(sqliteDb);

const execSync = sqliteDb.exec.bind(sqliteDb);
const allSync = sqliteDb.all.bind(sqliteDb);
const runSync = sqliteDb.run.bind(sqliteDb);

export const mockdb = {
  execAsync: execAsync,
  getAllAsync: allAsync,
  getFirstAsync: getAsync,
  runAsync: runAsync,
  execSync: execSync,
  getAllSync: allSync,
}


