import { iVaccineDataService, VaccineInfoJSON, VaccineListResponse, VaccineProduct, VaccineSheet, VaccineUpdate } from "@/interfaces/iVaccineData";
import logger from "@/utils/logger";
import * as FileSystem from "expo-file-system";
import * as Crypto from 'expo-crypto';
import assert from 'assert'
import tempJson from "@/services/__tests__/vaccineListService.data.json";
import AsyncStorage from '@react-native-async-storage/async-storage';
import VaccineEntity from "@/myorm/vaccine-entity";

class VaccineDataService implements iVaccineDataService {
    updateVaccineData(toUpdate: VaccineUpdate[]): boolean {
        throw new Error("Method not implemented.");
    }
    private fetchPDFs(): string[] {
        throw new Error("Method not implemented.");
    }

    updatePDFs(toUpdate: string[]): boolean {
        throw new Error("Method not implemented.");
    }

    

    vaccineQuery(input: string, language: string, field?: string): VaccineSheet[] {
        throw new Error("Method not implemented.");
    }

    private getProductIDs(): VaccineProduct[] {
        const productIDQuery = `SELECT productId, englishFormatId, frenchFormatId FROM vaccines`
        //const productNumbers: VaccineProduct[] = await VaccineProductEntity.createQueryBuilder("vaccine_product_ids").where(`vaccine_product`)
        //TODO: Implememnt query execution, for now returns mock
        const productNumbers: VaccineProduct[] = 
                        [
                            {
                                productId: 11766, 
                                englishFormatId: 74270,
                                frenchFormatId: 141783 
                            }, 
                            {
                                productId: 31990,
                                englishFormatId: 39096,
                                frenchFormatId: 141785
                            }
                        ] //await executeQuery(productIDQuery);
        return productNumbers;
    }

    async updatePDFFiles(uris: string[]): Promise<boolean> {
        throw new Error("Method not implemented.");
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
        })
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
                logger.error("Error getting vaccine list version from AsyncStorage\nError", error);
                reject(error)
              }
        })
        
    }


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
                logger.error("Error in getVaccineListJSON:", error)
                reject(error);
            }
        })
        
    }

    async storeVaccineListLocal(vaccineList: VaccineInfoJSON[]) {
        try {
            assert(vaccineList.length > 0, "Vaccine list should not be empty")
            const insertPromises = vaccineList.map(async (vaccine) => {
                try {
                    const vaccineEntity = new VaccineEntity(vaccine);
                    await vaccineEntity.save();
                } catch (error) {
                    logger.error("Error storing vaccine list\nError", error)
                    return null
                }
            })
            return await Promise.all(insertPromises);
        } catch (error) {
            logger.error("Error in store vaccine\nError", error)
            return null
        }
    }

    async downloadVaccinePDF(productId: string, formatId: string) {
        try {
            const fileUri = `${FileSystem.documentDirectory}vaccinePdfs/${productId}/${formatId}.pdf`;
            const uri = await FileSystem.downloadAsync(`https://publications.saskatchewan.ca/api/v1/products/${productId}/formats/${formatId}`, fileUri)
        } catch (error) {
            logger.error(`Error downloading vaccind PDF for productId: ${productId}\nError: `, error);
        }
    }

    async compareExternalPDFs(): Promise<VaccineProduct[]> {
        const productIds = this.getProductIDs();
        try {
            const comparePromises = productIds.map(async (product) => {
                try {
                    const productJSON = await (await fetch(`https://publications.saskatchewan.ca/api/v1/products/${product.productId}`)).json();
                   
                    const englishPDFFilename = productJSON.productFormats[0].digitalAttributes.fileaName;
                    const frenchPDFFilename = productJSON.productFormats[1].digitalAttributes.fileaName;
                    const localFilenames = await this.getLocalPDFFilenames(product.productId);

                    return {
                        productId: product.productId,
                        englishFormatId: englishPDFFilename === localFilenames.englishFilename ?  product.englishFormatId : undefined,
                        frenchFormatId: frenchPDFFilename === localFilenames.frenchFilename ? product.frenchFormatId : undefined 
                    }
                } catch (error) {
                    logger.error(`Error comparing PDFs for product ${product.productId}\nError: `, error)
                    return {
                        productId: product.productId
                    }
                }
            })
            const comparisons = await Promise.all(comparePromises);
            return comparisons
        } catch (error) {
            logger.error(`Error comparing PDFs\nError: `, error)
            return [];
        }
    }

    async getLocalPDFFilenames(productId: number): Promise<{englishFilename: string, frenchFilename: string}> {
        return new Promise((resolve, reject) => {
            const filenames = await VaccineEntity.query(`SELECT englishPDFFilename, frenchPDFFilename FROM vaccines WHERE productId = ?`, productId)
            resolve(filenames);
        })
 
    } 

    async getVaccineJSONSHA(): Promise<Response[]> {
        const productIDs = this.getProductIDs();

        try {
            const fetchPromises = productIDs.map(async (product) => {
                try {
                const response = await fetch(`https://publications.saskatchewan.ca/api/v1/products/${product.productId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error, Status: ${response.status}`);
                }

                const data = await response.json();
                return data; // Return the fetched data for each product
                } catch (error) {
                    logger.error(`Enable to fetch product ${product}\nerror: `, error)
                    return null;
                }
            
            })
            // Wait for all promises to resolve and filter out any null values
            const JSONSheets = await Promise.all(fetchPromises);
            return JSONSheets
        // Filter out any null values (in case some fetches failed)
        } catch (error) {
            logger.error("Error in getVaccineSheetJSON:", error);
            return [];
        }
    } 

        
}

export const vaccineDataService = new VaccineDataService();

