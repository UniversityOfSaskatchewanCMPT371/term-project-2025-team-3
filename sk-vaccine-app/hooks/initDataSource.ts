import { AppDataSource } from "@/database/data-source";
import logger from "@/utils/logger";
import { useEffect, useState } from "react";



export class InitDataSourceResults {
    isReady!: boolean;
    error!: string|null;

    
}




/**
 * Initializes the database. Should return `true` before the app renders
 * @returns return  s the current state of the initialization
 */
export default function useInitDataSource(): InitDataSourceResults {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string|null>(null);

    useEffect(() => {
          


        AppDataSource.initialize()
            .then(() => {
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