import VaccineDataController from "@/controllers/vaccineDataController";
import {
  iVaccineDataController,
  VaccineSheet,
} from "@/interfaces/iVaccineData";
import logger from "@/utils/logger";
import * as Network from "expo-network";
import { useEffect, useState } from "react";

export type VaccineSheetStatus = {
  /** holds the list of vaccines */
  vaccineSheets: VaccineSheet[];
  /** true if the vaccine list is still loading, otherwise false */
  loading: boolean;
  /** if an error occures a string representing the error is stored */
  error?: string;
  fetchResults: (searchValue?: string, searchColumn?: string) => Promise<void>;
};

/**
 * Retrieves the list of vaccine sheets.
 *
 * @param {Object} data The configuration for getting clinic information.
 * @param {iVaccineDataController} data.vaccineController The interface to use to access the vaccine data.
 * @param {string} [data.searchValue] Value to search for in the list of clinics.
 *   If null it gets all of the clinics.
 * @param {string} [data.searchColumn] The column to search for `searchValue` in.
 *   Ignored unless `searchValue` is set. If null, all columns are searched.
 *
 * @returns {VaccineSheetStatus} Object representing the current status of vaccine data loading, containing:
 *   @property {VaccineSheet[]}
 *      A list of vaccine sheets to be displayed
 *   @property {boolean} `loading`
 *      `true` if the data is still loading, otherwise `false`.
 *   @property {string | null} `error`
 *      An error message if an error occurred, or `null` if no error.
 */
export function useVaccineSheets(data: {
  vaccineController: iVaccineDataController;
  searchValue?: string;
  searchColumn?: string;
}): VaccineSheetStatus {
  const { vaccineController, searchValue, searchColumn } = data;

  const [vaccineSheets, setVaccineSheets] = useState<VaccineSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      setVaccineSheets(
        await vaccineController.searchVaccines(searchValue, searchColumn)
      );
    } catch (error) {
      logger.error(error);
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [searchValue]);

  //logger.debug("useVaccineSheets -> vaccineSheets:", vaccineSheets[0].associatedDiseases);
  logger.debug("useVaccineSheets -> loading:", loading);
  logger.debug("useVaccineSheets -> error:", error);
  logger.debug("useVaccineSheets -> fetchResults:", fetchResults);

  const response = {
    vaccineSheets: vaccineSheets,
    loading: loading,
    error: error ?? undefined,
    fetchResults,
  };

  return response;
}

/**
 *
 *
 *
 * @param {iVaccineDataController} vaccineController The interface to use to access the vaccine data.
 * @returns {Object}
 *    @property {boolean} success if the update was a success this will be true
 *    Even if no files are updated, if there are no errors this will be true
 *    @property {number} updated the number of files updated.
 *    @property {failed} number  the number of files attempted to be updated
 *    that failed.
 *    @property {error | undefined} Error if there is an error in the update
 *    it is shown here.
 *
 */
export function useUpdateVaccineSheets(vaccineController: iVaccineDataController) {
  const [isConnected, setIsConnected] = useState<boolean | undefined>(undefined);
  const [result, setResult] = useState<{
    success: boolean;
    updated: number;
    failed: number;
    error?: Error;
  }>({
    success: false,
    updated: 0,
    failed: 0,
  });

  useEffect(() => {
    let isMounted = true; // Prevent updates after unmount

    const tryUpdate = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected);

      if (!state.isConnected) {
        logger.debug(state.isConnected);
        logger.error("No network connection");
        return; // Don't run if offline
      }

      try {
        const updateResult = await vaccineController.updateVaccines();
        if (isMounted) setResult(updateResult);
      } catch (error: any) {
        logger.error(error);
        if (isMounted)
          setResult({ success: false, updated: 0, failed: 0, error });
      }
    };

    tryUpdate();

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
  }, []); // Empty dependency array → Runs once when app starts

  return result;
}

export function useVaccinePDF(uri: string) {}
