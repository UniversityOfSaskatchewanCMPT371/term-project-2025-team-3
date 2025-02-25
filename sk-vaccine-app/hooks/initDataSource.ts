import logger from "@/utils/logger";
import { useEffect, useState } from "react";
import * as SQLite from 'expo-sqlite';
import BaseEntity from "@/myorm/base-entity";



export class InitDataSourceResults {
    isReady!: boolean;
    error!: string|null;

    
}


const DB_NAME = "sk-vaccine-app.db"


/**
 * Initializes the database. Should return `true` before the app renders
 * @returns return  s the current state of the initialization
 */
export default function useInitDataSource(): InitDataSourceResults {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string|null>(null);

    useEffect(() => {
          


        SQLite.openDatabaseAsync(DB_NAME)
            .then((db) => {
                BaseEntity.db = db;
                logger.debug("Database initialized successfully:");
                setIsReady(true);
            })
            .catch((err: unknown) => {
                logger.error("Database initialization error:", err);
                setError(String(err));
            });
    }, []);

    return {
        isReady: isReady,
        error: error,
    }; 
}