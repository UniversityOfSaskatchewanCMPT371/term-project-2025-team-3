import {
  iVaccineDataController,
  VaccineListResponse,
  VaccinePDFData,
  VaccineSheet,
} from "@/interfaces/iVaccineData";
import VaccineEntity from "@/myorm/vaccine-entity";
import { VaccineDataService } from "@/services/vaccineDataService";
import logger from "@/utils/logger";

class PDFUpdateError extends Error {
  product_id: number;

  constructor(product_id: number, message = "Unable to update PDF.") {
    super(message);
    this.name = "NoInternetError";
    this.product_id = product_id;
  }
}

class VaccineUpdateError extends Error {
  constructor(message = "Unable to update PDF.") {
    super(message);
    this.name = "NoInternetError";
  }
}

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
      const upToDate = await this.vaccineListUpToDate();
      logger.info(`vaccineListUpToDate returned: ${upToDate}`); // Log the value of upToDate
      if (!upToDate) {
        logger.info("Updating vaccine list..."); // Log that updateVaccineList will be called
        await this.updateVaccineList();
      }

      // Promise.allSettled will wait for all promises to finish even if some error
      const pdfsToUpdate = await Promise.allSettled(
        (
          await this.vaccineDataService.compareExternalPDFs()
        ).map(async (vaccine: VaccinePDFData) => {
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
                vaccine.french?.filename
              );
            }
          } catch (error) {
            logger.error("Error updating pdfs in updateVaccines");
            throw new PDFUpdateError(vaccine.productId);
          }
        })
      );
      logger.debug(`PDFs to update ${pdfsToUpdate}`)

      // Errors are hanndled separately from the promises
      const errors = pdfsToUpdate.filter(
        (result) => result.status === "rejected"
      );
      errors.forEach((err) =>
        logger.error(`PDF update failed: ${err.reason.message}`)
      );

      if (errors.length > 0) {
        return {
          success: false,
          updated: pdfsToUpdate.length,
          failed: errors.length,
        };
      } else {
        return {
          success: true,
          updated: pdfsToUpdate.length,
          failed: 0,
        };
      }
      // Return success when all pdfs are updated.
    } catch (error: any) {
      logger.error(`Error in updateVaccines: ${error.message}`);
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
  private async updateVaccineList() {
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
   */
  private async vaccineListUpToDate(): Promise<boolean> {
    const remoteVersion =
      await this.vaccineDataService.getVaccineListVersionRemote();
    const localVersion =
      await this.vaccineDataService.getVaccineListVersionLocal();
    return remoteVersion === localVersion;
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
        return (await this.vaccineDataService.vaccineQuery(
          input,
          "english",
          field
        )) as VaccineSheet[];
      } else {
        return (await this.vaccineDataService.vaccineQuery(
          input
        )) as VaccineSheet[];
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
