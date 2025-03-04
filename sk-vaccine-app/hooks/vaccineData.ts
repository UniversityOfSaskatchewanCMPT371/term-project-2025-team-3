import {
  iVaccineDataController,
  VaccineSheet,
} from "@/interfaces/iVaccineData";
import logger from "@/utils/logger";
import { useNetworkState } from "expo-network";
import { useEffect, useState } from "react";

class NoInternetError extends Error {
  constructor(message = "No internet connection. Please try again later.") {
    super(message);
    this.name = "NoInternetError";
  }
}

export type VaccineSheetStatus = {
  /** holds the list of vaccines */
  vaccineSheets: VaccineSheet[];
  /** true if the vaccine list is still loading, otherwise false */
  loading: boolean;
  /** if an error occures a string representing the error is stored */
  error: string | null;
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

  const [vaccinesSheets, setVaccineSheets] = useState<VaccineSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setVaccineSheets(
          await vaccineController.searchVaccines(searchValue, searchColumn)
        );
      } catch (error) {
        setError(String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [vaccineController, searchValue, searchColumn]);

  const response = {
    vaccineSheets: vaccinesSheets,
    loading: loading,
    error: error,
  };

  return response;
}

export function updateVaccineSheets(vaccineController: iVaccineDataController) {
  const [success, setSuccess] = useState(false);
  const [updated, setUpdated] = useState(false);
  const networkState = useNetworkState(); // Store network state in a variable
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
    const tryUpdate = async () => {
      if (!networkState.isConnected) {
        throw new NoInternetError();
      }

      try {
        const updateResult = await vaccineController.updateVaccines();
        setResult(updateResult);
      } catch (error: any) {
        logger.error(error);
        setResult({ success: false, updated: 0, failed: 0, error });
      }
    };

    tryUpdate().catch((error) => console.error(error));
  }, [vaccineController, networkState.isConnected]);

  return result;
}

export function useVaccinePDF(uri: string) {}
