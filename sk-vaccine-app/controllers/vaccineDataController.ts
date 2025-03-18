import {
  iVaccineDataController,
  VaccineListResponse,
  VaccinePDFData,
  VaccineSheet,
  VaccineQueryResult,
} from "@/interfaces/iVaccineData";
import VaccineEntity from "@/myorm/vaccine-entity";
import * as FileSystem from "expo-file-system";
import {
  PDFUpdateError,
  VaccineListVersionError,
  VaccineUpdateError,
} from "@/utils/ErrorTypes";
import { VaccineDataService } from "@/services/vaccineDataService";
import logger from "@/utils/logger";

class VaccineDataController implements iVaccineDataController {
  private vaccineDataService: VaccineDataService;

  constructor(vaccineDataService: VaccineDataService) {
    this.vaccineDataService = vaccineDataService;
  }

  /**
   * Checks the remote vaccine list with a call to a local private functio.
   * PDFs are also checked to ensure they are up to date. Depending on these
   * checks all are updated
   *
   * This requires internet connectivity and a check WILL be in place
   *
   *
   * @returns
   *     | true if the update was successful
   *     | false if the update was unsuccesful
   */
  async updateVaccines(): Promise<{
    success: boolean;
    updated: number;
    failed: number;
  }> {
    try {
      return this.vaccineListUpToDate()
        .then((upToDate) => {
          logger.info(`vaccineListUpToDate returned: ${upToDate}`);
          if (!upToDate) {
            logger.info("Updating vaccine list...");
            return this.updateVaccineList().then(() => true); // Ensure update completes
          }
          return false; // No update needed
        })
        .then(() => this.vaccineDataService.compareExternalPDFs()) // Ensure updated list is used
        .then((pdfs) => {
          logger.debug(
            "VaccineDataController, updateVaccines: pdfs to check",
            pdfs
          );
          return Promise.allSettled(
            pdfs.map((vaccine: VaccinePDFData) =>
              (async () => {
                try {
                  if (vaccine.english?.formatId) {
                    await this.vaccineDataService.downloadVaccinePDF(
                      vaccine.productId,
                      vaccine.english.formatId
                    );
                  }
                  if (vaccine.french?.formatId) {
                    await this.vaccineDataService.downloadVaccinePDF(
                      vaccine.productId,
                      vaccine.french.formatId
                    );
                  }
                  if (vaccine.english || vaccine.french) {
                    await this.vaccineDataService.updateLocalPDFFilenames(
                      vaccine.productId,
                      vaccine.english?.filename,
                      vaccine.french?.filename,
                      vaccine.english?.formatId,
                      vaccine.french?.formatId
                    );
                  }
                } catch (error) {
                  logger.error(
                    `Error updating PDFs for product ${vaccine.productId} Error ${error}`
                  );
                  throw new PDFUpdateError(vaccine.productId);
                }
              })()
            )
          );
        })
        .then((pdfsToUpdate) => {
          const errors = pdfsToUpdate.filter(
            (result) => result.status === "rejected"
          );
          const successes = pdfsToUpdate.filter(
            (result) => result.status === "fulfilled"
          );

          /*
          errors.forEach((err) =>
            logger.error(`PDF update failed: ${err.reason.message}`)
          );
          */
          return {
            success: errors.length === 0,
            updated: successes.length,
            failed: errors.length,
          };
        })
        .catch((error) => {
          logger.error(`Error in updateVaccines: ${error.message}`);
          throw new VaccineUpdateError(error);
        });
    } catch (error: any) {
      logger.error(`Unexpected error in updateVaccines: ${error.message}`);
      throw new VaccineUpdateError(error);
    }
  }

  /**
   * Gets the remote vaccine list, updates the local version and local list
   *
   * Pre Condiitons:
   *      - The vaccine datatable must exist.
   *      - There must be internet connectivity.
   * Post Condiitons:
   *      This modifies the vaccine datatable, updating each altered row.
   *
   */
  protected async updateVaccineList() {
    try {
      const vaccineList: VaccineListResponse =
        await this.vaccineDataService.getVaccineListRemote();
      await this.vaccineDataService.storeVaccineListVersionLocal(
        vaccineList.version
      );
      await this.vaccineDataService.storeVaccineListLocal(vaccineList.vaccines);
    } catch (error: any) {
      logger.error(`Error updating vaccine list: ${error.message}`);
    }
  }

  /**
   * Checks if the local vaccine list is up to date with the remote one.
   *
   * Pre Conditions:
   *      - There must be interet connectivity
   *
   *
   * @returns A promise containing a boolean value. True if the list is
   * up to date, false otherwise
   * @throws {VaccineListVersionError} Remote version should never be less
   * than the local version
   */
  protected async vaccineListUpToDate(): Promise<boolean> {
    const remoteVersion =
      await this.vaccineDataService.getVaccineListVersionRemote();
    const localVersion =
      await this.vaccineDataService.getVaccineListVersionLocal();
    if (remoteVersion < localVersion) {
      throw new VaccineListVersionError();
    } else {
      return remoteVersion === localVersion;
    }
  }

  /**
   *
   * Takes in an input string to search by and filter fields
   *
   * @param input Must be a string, if it does not exist then will get all rows
   * @param field Does not need to be present, currently a string, should be
   * a catagory in the future
   *
   * @returns a list of vaccine sheets to be displayed
   */
  async searchVaccines(
    input?: string,
    field?: string
  ): Promise<VaccineSheet[]> {
    // TODO implement checking of language with settings page;
    try {
      if (field) {
        return (
          await this.vaccineDataService.vaccineQuery(input, "english", field)
        ).map((element: VaccineQueryResult) => {
          return {
            pdfPath: `${FileSystem.documentDirectory}vaccinePdfs/${element.productId}/${element.formatId}.pdf`, // Properly assigning formatId
            ...element, // Spreading other properties
          };
        }) as VaccineSheet[];
      } else {
        return (
          await this.vaccineDataService.vaccineQuery(input, "english", field)
        ).map((element: VaccineQueryResult) => {
          return {
            pdfPath: `${FileSystem.documentDirectory}vaccinePdfs/${element.productId}/${element.formatId}.pdf`, // Properly assigning formatId
            ...element, // Spreading other properties
          };
        }) as VaccineSheet[];
      }
    } catch (error) {
      logger.error(
        `Error in searchVaccines in the VaccineDataController: ${error}`
      );
      throw error;
    }
  }
}

export default VaccineDataController;
