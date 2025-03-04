import iClinicData from "@/interfaces/iClinicData";
import {
  iVaccineDataController,
  VaccineSheet,
} from "@/interfaces/iVaccineData";
import { ClinicArray } from "@/services/clinicDataService";
import { useEffect, useState } from "react";

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
export function getVaccineSheets(data: {
  vaccineController: iVaccineDataController;
  searchValue?: string;
  searchColumn?: string;
}): VaccineSheetStatus {
  const { vaccineController, searchValue, searchColumn } = data;

  const [vaccinesSheets, setVaccineSheets] = useState<VaccineSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessFailed, setAccessFailed] = useState(false);
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

export function getVaccinePDF(uri: string) {}
