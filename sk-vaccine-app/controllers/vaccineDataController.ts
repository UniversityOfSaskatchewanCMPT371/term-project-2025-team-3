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
   * @precondition This requires internet connectivity
   * @precondition The remote vaccine list must exist
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
        .then(async (upToDate) => {
          logger.info(`vaccineListUpToDate returned: ${upToDate}`);
          if (!upToDate) {
            logger.info("Updating vaccine list...");
            await this.updateVaccineList();
            // Wait for half a second for the db to insert
            await new Promise((resolve) => setTimeout(resolve, 500));
            return true;
          }
          return false; // No update needed
        })
        .then(async () => {
          return await this.vaccineDataService.compareExternalPDFs();
        })
        .then((pdfs) => {
          //logger.debug("VaccineDataController, updateVaccines: pdfs to check",pdfs);
          return Promise.allSettled(
            pdfs.map(async (vaccine: VaccinePDFData) => {
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
                  `Error updating PDFs for product ${vaccine.productId}: ${error}`
                );

                throw new PDFUpdateError(vaccine.productId);
              }
            })
          );
        })
        .then((pdfsToUpdate) => {
          const errors = pdfsToUpdate.filter(
            (result) => result.status === "rejected"
          );
          const successes = pdfsToUpdate.filter(
            (result) => result.status === "fulfilled"
          );

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

   * @precondition The vaccine datatable must exist.
   * @precondition There must be internet connectivity.
   *
   * @postcondition This modifies the vaccine datatable, updating each altered row.
   *
   */
  protected async updateVaccineList() {
    try {
      const vaccineList: VaccineListResponse =
        await this.vaccineDataService.getVaccineListRemote();
      await this.vaccineDataService.storeVaccineListVersionLocal(
        vaccineList.timestamp
      );
      const toDelete = await this.vaccineDataService.checkExistingVaccines(
        vaccineList.vaccines
      );
      await this.vaccineDataService.deleteVaccines(toDelete);
      await this.vaccineDataService.storeVaccineListLocal(vaccineList.vaccines);
    } catch (error: any) {
      logger.error(`Error updating vaccine list: ${error.message}`);
    }
  }

  /**
   * Checks if the local vaccine list is up to date with the remote one.
   *
   * @precondition There must be interet connectivity
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
    field?: string,
    language: "english" | "french" = "english"
  ): Promise<VaccineSheet[]> {
    // TODO implement checking of language with settings page;
    try {
      if (field) {
        return (
          await this.vaccineDataService.vaccineQuery(language, input, field)
        ).map((element: VaccineQueryResult) => {
          return {
            pdfPath: `${FileSystem.documentDirectory}vaccinePdfs/${element.productId}/${element.formatId}.pdf`, // Properly assigning formatId
            associatedDiseases: element.associatedDiseases,
            starting: element.starting,
            vaccineName: element.vaccineName,
          };
        }) as VaccineSheet[];
      } else {
        return (
          await this.vaccineDataService.vaccineQuery(language, input)
        ).map((element: VaccineQueryResult) => {
          return {
            pdfPath: `${FileSystem.documentDirectory}vaccinePdfs/${element.productId}/${element.formatId}.pdf`, // Properly assigning formatId
            associatedDiseases: element.associatedDiseases,
            starting: element.starting,
            vaccineName: element.vaccineName,
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
