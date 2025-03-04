import {
  iVaccineDataService,
  Vaccine,
  VaccineInfoJSON,
  VaccineListResponse,
  VaccinePDFData,
  VaccineProduct,
  VaccineSheet,
} from "@/interfaces/iVaccineData";
import logger from "@/utils/logger";
import * as FileSystem from "expo-file-system";
import assert from "assert";
import tempJson from "@/services/__tests__/vaccineListService.data.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VaccineEntity from "@/myorm/vaccine-entity";

/**
 * @class Implements `iVaccineService`, is used to apply logic to external APIs
 * and internal databases/filestorage
 *
 */
export class VaccineDataService implements iVaccineDataService {
  async vaccineQuery(
    input: string,
    language: "english" | "french" = "english",
    field?: string
  ): Promise<any[]> {
    let query = `SELECT vaccineName, assoiatedDiseases${
      language == "english" ? "English" : "French"
    } AS associatedDiseases, ${
      language == "english" ? "english" : "french"
    } AS pdfPath, starting FROM $table WHERE`;

    const columns = await VaccineEntity.getColumns();

    if (field) {
      query += `${field} LIKE ?`;
    } else {
      query += columns
        .map((col) => {
          return `${col} LIKE ?`;
        })
        .join("OR");
    }

    return new Promise(async (resolve, reject) => {
      try {
        resolve(
          await VaccineEntity.query(query, ...columns.map(() => `%${input}`))
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Gets all of the SHA vaccine JSON ids as well as the ids for the language
   * specific formats.
   *
   *
   * Pre Conditions:
   *  - database must be initialized
   *
   * @returns a list of all vaccine product ids and format ids.
   */
  private async getProductIDs(): Promise<VaccineProduct[]> {
    const productNumbers: VaccineProduct[] = await VaccineEntity.query(
      `SELECT productId, englishFormatId, frenchFormatId FROM $table`
    );
    return productNumbers;
  }

  /**
   * Gets the remote version of the Vaccine List. This version number is
   * obtained from the vaccine list JSON endpoint and store in async storage
   *
   * If the version number is not present in storage a -1 is returned to
   * ensure that it is always less than the new version
   * @returns A promise containing the version number.
   */
  async getVaccineListVersionRemote(): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        // TODO: Put in an actual fetch wen there is somewhere to fetch from
        //const response = await fetch();
        const response = tempJson;
        resolve(response.version);
      } catch (error) {
        logger.error("Error getting remote vaccine list version\nError", error);
        reject(error);
      }
    });
  }

  /**
   *
   * Gets a list of VaccineSheet object which contain the local vaccine
   * information PDFs and other related info. Retrieves it in either
   * english or french
   *
   * @param language must be `english` or `french`, this is required
   * @returns A promise containing a list of `VaccineSheet` objects
   */
  async getVaccineSheets(
    language: "english" | "french"
  ): Promise<VaccineSheet[]> {
    return new Promise(async (resolve, reject) => {
      try {
        if (language == "english") {
          resolve(
            await VaccineEntity.query(
              `SELECT vaccineName, associatedDiseasesEnglish AS associatedDiseases, englishPDFFilename AS pdfPath, starting FROM $table`
            )
          );
        } else {
          resolve(
            await VaccineEntity.query(
              `SELECT vaccineName, associatedDiseasesFrench AS associatedDiseases, frenchPDFFilename AS pdfPath, starting FROM $table`
            )
          );
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stores the version of the Vaccine List. This version number is obtained
   * from the vaccine list JSON endpoint
   * @param version a string representing the version number to set
   */
  async storeVaccineListVersionLocal(version: number) {
    try {
      await AsyncStorage.setItem("vaccine_list_version", version.toString());
    } catch (error) {
      logger.error("Error saving value to AsyncStorage", error);
    }
  }

  /**
   * Gets the local version of the Vaccine List. This version number is
   * obtained from the vaccine list JSON endpoint and store in async storage
   *
   * If the version number is not present in storage a -1 is returned to
   * ensure that it is always less than the new version
   * @returns A promise containing the version number. It is type casted as
   * AsyncStorage can only store strings
   */
  async getVaccineListVersionLocal(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        const version = await AsyncStorage.getItem("vaccine_list_version");
        if (version === null) {
          resolve(-1);
        } else {
          resolve(parseInt(version));
        }
      } catch (error) {
        logger.error(
          "Error getting vaccine list version from AsyncStorage\nError",
          error
        );
        reject(error);
      }
    });
  }

  /**
   * Retrieves the remote vaccine list hosted as a JSON file
   *
   * Pre Conditions:
   *  - Internet connectivity must be present
   *
   * @returns a promise containing the updated vaccine list
   */
  async getVaccineListRemote(): Promise<VaccineListResponse> {
    return new Promise((resolve, reject) => {
      try {
        // TODO: Don't have the link to request from yet
        //const response = await fetch()
        const response = tempJson;
        /*
                if (!response.ok) {
                    throw new Error(`HTTP error, Status: ${response.status}`);
                }
                const data = await response.json();
                */
        const data = response;
        resolve(data as VaccineListResponse);
      } catch (error) {
        logger.error("Error in getVaccineListJSON:", error);
        reject(error);
      }
    });
  }

  /**
   * Stores the remote vaccine list locally, returns a promise
   * @param vaccineList a list of VaccineInfoJSON objects to insert into
   * the vaccine data table. This will also update and existing row if
   * a row with the productId already exists.
   * @returns a void promise
   */
  async storeVaccineListLocal(vaccineList: VaccineInfoJSON[]): Promise<void> {
    try {
      assert(vaccineList.length > 0, "Vaccine list should not be empty");
      const insertPromises = vaccineList.map(async (vaccine) => {
        try {
          VaccineEntity.query(
            `INSERT OR REPLACE INTO $table
                        (
                        vaccineName, 
                        productId, 
                        starting, 
                        associatedDiseasesEnglish,
                        associatedDiseasesFrench,
                        ) VALUES (?, ?, ?, ?, ?)`,
            vaccine.vaccineName,
            vaccine.productId,
            vaccine.starting,
            vaccine.associatedDiseases.english,
            vaccine.associatedDiseases.french
          );
        } catch (error) {
          logger.error("Error storing vaccine list\nError", error);
        }
      });
      await Promise.all(insertPromises);
    } catch (error) {
      logger.error("Error in store vaccine\nError", error);
    }
  }

  /**
   * This will take the provided ids and download the related pdf from the
   * saskatchewn publications api
   *
   * @param productId the Id of the vaccine being updated, used to build
   * the path, cannot be zero, must exist in the database
   * @param formatId the format id, this refers to the id of the english
   * or french PDF, used to build the path cannot be 0
   * @returns a promise containing a string, this string is the path to the
   * pdf within the mobile device
   */
  async downloadVaccinePDF(
    productId: number,
    formatId: number
  ): Promise<string> {
    assert(productId != null && formatId != null);
    try {
      const fileUri = `${FileSystem.documentDirectory}vaccinePdfs/${productId}/${formatId}.pdf`;
      const { uri } = await FileSystem.downloadAsync(
        `https://publications.saskatchewan.ca/api/v1/products/${productId}/formats/${formatId}`,
        fileUri
      );
      return uri;
    } catch (error) {
      logger.error(
        `Error downloading vaccind PDF for productId: ${productId}\nError: `,
        error
      );
      return "";
    }
  }

  /**
   * Compares the filenames of external and intneral PDFs to check for
   * file changes/updates
   *
   * @returns a promise containaing a list of data relating to externa, pdfs.
   * This consists of the filenames of the external files as well as the
   * local name comparisons
   */
  async compareExternalPDFs(): Promise<VaccinePDFData[]> {
    const productIds = await this.getProductIDs();
    try {
      const comparePromises = productIds.map(async (product) => {
        try {
          const productJSON = await (
            await fetch(
              `https://publications.saskatchewan.ca/api/v1/products/${product.productId}`
            )
          ).json();

          const englishPDFFilename: string =
            productJSON.productFormats[0].digitalAttributes.fileaName;
          const frenchPDFFilename: string =
            productJSON.productFormats[1].digitalAttributes.fileaName;
          const localFilenames = await this.getLocalPDFFilenames(
            product.productId
          );

          return {
            productId: product.productId,
            english: {
              filename: englishPDFFilename,
              formatId:
                englishPDFFilename === localFilenames.englishFilename
                  ? undefined
                  : product.englishFormatId,
            },
            french: {
              filename: frenchPDFFilename,
              formatId:
                frenchPDFFilename === localFilenames.frenchFilename
                  ? undefined
                  : product.frenchFormatId,
            },
          };
        } catch (error) {
          logger.error(
            `Error comparing PDFs for product ${product.productId}\nError: `,
            error
          );
          return {
            productId: product.productId,
          };
        }
      });
      const comparisons = await Promise.all(comparePromises);
      return comparisons;
    } catch (error) {
      logger.error(`Error comparing PDFs\nError: `, error);
      return [];
    }
  }

  /**
   *
   * Retrieves the names of the local PDFs of both the english and french
   * versions
   *
   * @param productId the vaccine to check, a number greater than 0 and
   * existing in the database
   * @returns an promise containing an object with the english and french
   * PDF names, both in the form of strings
   */
  async getLocalPDFFilenames(
    productId: number
  ): Promise<{ englishFilename: string; frenchFilename: string }> {
    return new Promise(async (resolve, reject) => {
      const filenames = await VaccineEntity.query(
        `SELECT englishPDFFilename, frenchPDFFilename FROM $table WHERE productId = ?`,
        productId
      );
      resolve(filenames);
    });
  }

  /**
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
  async updateLocalPDFFilenames(
    productId: number,
    englishFilename?: string,
    frenchFilename?: string
  ): Promise<void> {
    let statment = `UPDATE $table SET 
                ${englishFilename ? "englishPDFFilename = ?," : ""} 
                ${
                  frenchFilename ? "frenchPDFFilename = ?" : ""
                } WHERE productId = ?`;
    return new Promise(async (resolve, reject) => {
      VaccineEntity.query(statment, englishFilename, frenchFilename, productId);
    });
  }

  /**
   * Gets the entire JSON sheet for each product ID from the Government of
   * Saskatchewan publications api
   * @returns A list of responses in the form of the JSON received. It is
   * much too large to warrant its own type
   *
   * !! This is going to be removed, it is not needed and cannot test reliably !!
   *
   */
  async getVaccineJSONSHA(): Promise<Response[]> {
    const productIDs = await this.getProductIDs();

    try {
      // Building all of the promises
      const fetchPromises = productIDs.map(async (product) => {
        try {
          const response = await fetch(
            `https://publications.saskatchewan.ca/api/v1/products/${product.productId}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error, Status: ${response.status}`);
          }

          const data = await response.json();
          return data; // Return the fetched data for each product
        } catch (error) {
          logger.error(`Enable to fetch product ${product}\nerror: `, error);
          return null;
        }
      });
      // Execute all of the promises at once
      const JSONSheets = await Promise.all(fetchPromises);
      return JSONSheets;
    } catch (error) {
      logger.error("Error in getVaccineSheetJSON:", error);
      return [];
    }
  }
}
