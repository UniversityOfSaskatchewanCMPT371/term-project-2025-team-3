/**
 * The response to a vaccine data request
 */
export type VaccineSheet = {
  vaccineName: string;
  associatedDiseases: string[];
  pdfPath: string;
  /**
   * @field starting: This could be age or grade
   */
  starting: string;
};

export type VaccineQueryResult = {
  vaccineName: string;
  associatedDiseases: string[];
  formatId: string;
  productId: string;
  /**
   * @field starting: This could be age or grade
   */
  starting: string;
};

/**
 * Used when updating filename and checking for differences
 */
export type VaccinePDFData = {
  productId: number;
  english?: {
    filename: string;
    formatId?: number;
  };
  french?: {
    filename: string;
    formatId?: number;
  };
};

export interface Vaccine {
  vaccineName: string;
  productId: number;
  englishFormatId: number;
  frenchFormatId: number;
  englishPDFFilename: string;
  frenchPDFFilename: string;
  starting: string;
  associatedDiseasesEnglish: string[];
  associatedDiseasesFrench: string[];
}

export type VaccineListResponse = {
  timestamp: number;
  vaccines: VaccineInfoJSON[];
};

export type VaccineProduct = {
  productId: number;
  englishFormatId?: number;
  frenchFormatId?: number;
};

export type VaccineInfoJSON = {
  vaccineName: string;
  productId: number;
  starting: string;
  associatedDiseases: {
    english: string[];
    french: string[];
  };
};

export interface iVaccineDataService {
  downloadVaccinePDF(productId: number, formatId: number): Promise<string>;

  /**
   * @async this function is asynchronous
   */
  compareExternalPDFs(): Promise<VaccinePDFData[]>;

  /**
   * @async this function is asynchronous
   * Takes in a product id and potentially an english and french filename.
   * Filenames that exist are updated in the row linked to the product Id
   * @param productId the id of the row to update, a vaccine entry
   *                  This must be a positive number which already exists in
   *                  the table.
   * @param englishFilename the new name of the remote vaccine pdf in english
   *                        This must be a string.
   * @param frenchFilename the new name of the remote vaccine pdf in french
   *                       This must be a string.
   * @returns A void promise.
   */
  updateLocalPDFFilenames(
    productId: number,
    englishFilename?: string,
    frenchFilename?: string
  ): Promise<void>;

  /**
   * @async this function is asynchronous
   * Stores the remote vaccine list locally, returns a promise
   * @param vaccineList a list of VaccineInfoJSON objects to insert into
   * the vaccine data table. This will also update and existing row if
   * a row with the productId already exists.
   * @returns a void promise
   */
  storeVaccineListLocal(vaccineList: VaccineInfoJSON[]): Promise<void>;

  /**
   * @async this function is asynchronous
   * Stores the version of the Vaccine List. This version number is obtained
   * from the vaccine list JSON endpoint
   * @param version a string representing the version number to set
   */
  storeVaccineListVersionLocal(version: number): Promise<void>;

  /**
   * @async this function is asynchronous
   * Gets the local version of the Vaccine List. This version number is
   * obtained from the vaccine list JSON endpoint and store in async storage
   *
   * If the version number is not present in storage a -1 is returned to
   * ensure that it is always less than the new version
   * @returns A promise containing the version number. It is type casted as
   * AsyncStorage can only store strings
   */
  getVaccineListVersionLocal(): Promise<number>;

  getVaccineListRemote(): Promise<VaccineListResponse>;

  /**
   * Queries the database for vaccine sheets
   * @param input The value to search for.
   * @param field The field to search in, might be removed might be
   * updated to reflect multiple options
   * @param language The language to query for, defaults to "english" if no
   * value is provided
   * @param order The sorting order for the results
   * @return A list of responses from the
   */
  vaccineQuery(
    language: "english" | "french",
    input?: string,
    searchColumn?: string,
    order?: {
      ascending: true | false;
      column: "vaccineName" | "associatedDiseases" | "starting";
    }
  ): Promise<VaccineQueryResult[]>;
}

export interface iVaccineDataController {
  /**
   * Makes a request to update the vaccine PDFs
   * @returns a promise containing true if the update was sucessfull,
   * and false if there was an error
   */
  updateVaccines(): Promise<{
    success: boolean;
    updated: number;
    failed: number;
  }>;

  /**
   * Search for vaccine sheets that are stored on device.
   * @param input The value to search for.
   * @param field The field to search in, might be removed might be
   * updated to reflect multiple options
   * @return A list of vaccine sheets filtered by the input
   */
  searchVaccines(input?: string, field?: string): Promise<VaccineSheet[]>;
}
