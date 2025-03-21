import {
  iVaccineDataService,
  Vaccine,
  VaccineInfoJSON,
  VaccineListResponse,
  VaccinePDFData,
  VaccineProduct,
  VaccineQueryResult,
  VaccineSheet,
} from "@/interfaces/iVaccineData";
import logger from "@/utils/logger";
import * as FileSystem from "expo-file-system";
import assert from "assert";
import tempJson from "@/services/vaccineListService.data.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VaccineEntity from "@/myorm/vaccine-entity";
import { FetchError, PDFDownloadError, PDFUpdateError } from "@/utils/ErrorTypes";

/**
 * @class Implements `iVaccineService`, is used to apply logic to external APIs
 * and internal databases/filestorage
 *
 */
export class VaccineDataService implements iVaccineDataService {
  /**
   *
   * Builds and runs a query against the vaccine data table returning the
   * filtered rows
   *
   * @param {string | undefined} input if not given it will return all results,
   * @param {"english" | "french"} language if a default language is not
   *  provided it will use english
   * @param {string | undefined} searchColumn search by a specific column
   * @param order if not given the default orfer will be given
   *    @property {boolean} ascending
   *      Decides whether the data will be ordered ascending or descending
   *    @property {"vaccineName", "associatedDiseases", "starting"} column
   *      Three possible options to order the information by
   *      This is required when changing the order.
   * @returns
   */
  async vaccineQuery(
    input?: string,
    language: "english" | "french" = "english",
    searchColumn?: string,
    order?: {
      ascending: true | false;
      column: "vaccineName" | "associatedDiseases" | "starting";
    }
  ): Promise<VaccineQueryResult[]> {
    let query = `SELECT vaccineName, associatedDiseases${
      language == "english" ? "English" : "French"
    } AS associatedDiseases, ${
      language == "english" ? "english" : "french"
    }FormatId AS formatId, productId, starting FROM $table`;

    let params: string[] = [];

    if (input) {
      const columns = [
        `vaccineName`,
        `assoiatedDiseases${language == "english" ? "English" : "French"}`,
        `starting`,
      ];
      query += ` WHERE `;
      if (searchColumn) {
        query += `${searchColumn} LIKE ?`;
        params = [`%${input}%`];
      } else {
        query += columns
          .map((col) => {
            return `${col} LIKE ?`;
          })
          .join(" OR ");
        params = columns.map(() => `%${input}%`);
      }
    }

    if (order) {
      query += ` ORDER BY ${order.column} ${order.ascending ? "ASC" : "DESC"}`;
    }
    logger.debug(`Vaccine query ${query}`);
    try {
      const result: VaccineQueryResult[] = await VaccineEntity.query(
        query,
        ...params
      );
      logger.debug(`Vaccine query result ${result[0]}`);
      return result;
    } catch (error) {
      logger.error(`Error running vaccineQuery ${error}`);
      throw error;
    }
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
  async getProductIDs(): Promise<VaccineProduct[]> {
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
        logger.debug(`Remote vaccine list version: ${response.version}`);
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
        logger.debug(`Local list version: ${version}`);
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

    const url:string = "";

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
        logger.debug(`Remote list version :${response.version}`);
        const data = response;
        resolve(data as VaccineListResponse);
      } catch (error) {
        logger.error("Error in getVaccineListRemote:", error);
        reject(new FetchError(url));
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
      const insertPromises = vaccineList.forEach(async (vaccine) => {
        try {
          const vaccineEntry = new VaccineEntity({
            vaccineName: vaccine.vaccineName,
            productId: vaccine.productId,
            starting: vaccine.starting,
            associatedDiseasesEnglish: vaccine.associatedDiseases.english,
            associatedDiseasesFrench: vaccine.associatedDiseases.french,
          });
          vaccineEntry.save();
          logger.debug(`Vaccine stored in DB ${vaccineEntry}`);
        } catch (error) {
          logger.error("Error storing vaccine list\nError", error);
        }
      });
      logger.debug(insertPromises);
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
      // Define the directory and file path
      const dirPath = `${FileSystem.documentDirectory}vaccinePdfs/${productId}/`;
      const fileUri = `${dirPath}${formatId}.pdf`;

      // Ensure the directory exists
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
      }
      logger.debug(`Attempting to download ${productId} with ${formatId}`);
      // Download the PDF
      const { uri } = await FileSystem.downloadAsync(
        `https://publications.saskatchewan.ca/api/v1/products/${productId}/formats/${formatId}/download`,
        fileUri
      );

      logger.info(`PDF Downloaded, uri: ${uri}`);
      return uri;
    } catch (error) {
      logger.error(
        `Error downloading vaccine PDF for productId: ${productId}\nError: `,
        error
      );
      throw new PDFDownloadError(productId);
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
    logger.debug(`Compare PDF productIds ${productIds}`)
    try {
      const comparePromises = productIds.map(async (product) => {
        try {
          const productJSON = await (
            await fetch(
              `https://publications.saskatchewan.ca/api/v1/products/${product.productId}`
            )
          ).json();

          //logger.debug(productJSON.productFormats[0]);

          const englishPDFFilename: string =
            productJSON.productFormats[0].digitalAttributes.fileName;
          const frenchPDFFilename: string =
            productJSON.productFormats[1].digitalAttributes.fileName;
          const englishRemoteProductID =
            productJSON.productFormats[0].digitalAttributes.productFormatId;
          const frenchRemoteProductID =
            productJSON.productFormats[1].digitalAttributes.productFormatId;
          const localFilenames = await this.getLocalPDFFilenames(
            product.productId
          );
          logger.debug(
            `CompareExternalPDFs localFileNames: ${localFilenames.englishPDFFilename}, ${localFilenames.frenchPDFFilename} remoteFilenames: ${englishPDFFilename}, ${frenchPDFFilename}`
          );
          logger.debug(
            `CompareExternalPDFs productIDs passed: ${product.englishFormatId} ${product.frenchFormatId}`
          )


          return {
            productId: product.productId,
            english: {
              filename: englishPDFFilename,
              formatId:
                
                englishPDFFilename === localFilenames.englishPDFFilename
                  ? undefined
                  : englishRemoteProductID
            },
            french: {
              filename: frenchPDFFilename,
              formatId:
                frenchPDFFilename === localFilenames.frenchPDFFilename
                  ? undefined
                  : frenchRemoteProductID
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
  async getLocalPDFFilenames(productId: number): Promise<VaccineEntity> {
    try {
      const vaccine = await VaccineEntity.findOne({ where: {productId} });

      if (!vaccine) {
        throw new Error(`Vaccine with productId ${productId} not found`);
      }
      logger.debug(
        `Current local filenames ${vaccine.englishPDFFilename} ${vaccine.frenchPDFFilename}`
      );
      return vaccine;
    } catch (error) {
      throw error;
    }
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
    frenchFilename?: string,
    englishFormatId?: number,
    frenchFormatId?: number
  ): Promise<void> {
    try {
      // Fetch the entity from the database
      const vaccine = await VaccineEntity.findOne({ where: {productId} });

      if (!vaccine) {
        throw new Error(`Vaccine with productId ${productId} not found`);
      }
      logger.debug(
        `When updating local filenames ${vaccine.id}, ${vaccine.productId}`
      );

      // Update only the provided fields
      if (englishFilename !== undefined) {
        vaccine.englishPDFFilename = englishFilename;
      }
      if (frenchFilename !== undefined) {
        vaccine.frenchPDFFilename = frenchFilename;
      }
      if (englishFormatId !== undefined) {
        vaccine.englishFormatId = englishFormatId;
      }
      if (frenchFormatId !== undefined) {
        vaccine.frenchFormatId = frenchFormatId;
      }

      // Save the updated entity back to the database
      await vaccine.save();
    } catch (error) {
      logger.error(error);
      throw new PDFUpdateError(productId, "Unable to update local filenames");
    }
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
