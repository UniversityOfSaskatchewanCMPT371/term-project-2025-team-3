jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn().mockReturnValue({
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
    execSync: jest.fn(),
    getAllSync: jest.fn(),
  } as unknown as SQLite.SQLiteDatabase),
}));
import * as SQLite from 'expo-sqlite';
import VaccineDataController from "@/controllers/vaccineDataController";
import { VaccineDataService } from "@/services/vaccineDataService";
import { VaccinePDFData } from "@/interfaces/iVaccineData";
import { PDFDownloadError, VaccineListVersionError, FetchError } from "../../utils/ErrorTypes";
import logger from "@/utils/logger";

// Mocking the logger
jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// This class allows for testing protected functions
class TestableVaccineDataController extends VaccineDataController {
  constructor(vaccineDataService: VaccineDataService) {
    super(vaccineDataService);
  }

  public async vaccineListUpToDate() {
    return super.vaccineListUpToDate();
  }

  public async updateVaccineList() {
    return super.updateVaccineList();
  }
}

// Mock the VaccineDataService class
jest.mock("../../services/vaccineDataService");

describe("VaccineDataController MockDB Tests", () => {
  let vaccineDataController: VaccineDataController;
  let mockVaccineDataService: jest.Mocked<VaccineDataService>;

  beforeEach(() => {
    // Create a mocked instance of VaccineDataService
    mockVaccineDataService =
      new VaccineDataService() as jest.Mocked<VaccineDataService>;

    // Explicitly mock methods of the service we expect to use
    mockVaccineDataService.vaccineListUpToDate = jest.fn();
    mockVaccineDataService.updateVaccineList = jest.fn();
    mockVaccineDataService.compareExternalPDFs = jest.fn();
    mockVaccineDataService.downloadVaccinePDF = jest.fn();
    mockVaccineDataService.updateLocalPDFFilenames = jest.fn();
    mockVaccineDataService.getLocalPDFFilenames = jest.fn(); // Mocking getLocalPDFFilenames

    // Inject the mocked VaccineDataService into the controller
    vaccineDataController = new VaccineDataController(mockVaccineDataService);

    // Spy on the controller methods that we want to test
    jest.spyOn(vaccineDataController, "vaccineListUpToDate");
    jest.spyOn(vaccineDataController, "updateVaccineList");
    jest.spyOn(mockVaccineDataService, "updateLocalPDFFilenames");

    // Spy on the service methods used within the controller methods
    jest.spyOn(mockVaccineDataService, "updateLocalPDFFilenames");
    jest.spyOn(mockVaccineDataService, "compareExternalPDFs");
    jest.spyOn(mockVaccineDataService, "downloadVaccinePDF");
    jest.spyOn(mockVaccineDataService, "getLocalPDFFilenames"); // Spying on getLocalPDFFilenames
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("updateVaccines() Tests", () => {
    test("should update 1 vaccine successfully", async () => {
      const expected = {
        failed: 0,
        success: true,
        updated: 1,
      };

      mockVaccineDataService.downloadVaccinePDF.mockImplementation(
        async (productId: number, formatId: number) => {
          if (productId === 321) {
            throw new PDFDownloadError(productId);
          } else {
            return `https://publications.saskatchewan.ca/api/v1/products/${productId}/formats/${formatId}/download`; // Custom return for this case
          }
        }
      );

      // Mock the service methods used in the updateVaccines method
      mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false); // Mock vaccine list not up-to-date
      mockVaccineDataService.updateVaccineList.mockResolvedValue(undefined); // Mock successful update
      mockVaccineDataService.compareExternalPDFs.mockResolvedValue([
        {
          productId: 11766,
          english: { formatId: 123, filename: "vaccine1_english.pdf" },
          french: { formatId: 456, filename: "vaccine1_french.pdf" },
        },
      ] as VaccinePDFData[]); // Mock external PDFs

      const result = await vaccineDataController.updateVaccines();
      console.log(result);

      expect(result).toEqual(expected);
    });

    test("should update 10 vaccines successfully", async () => {
      const expected = {
        failed: 0,
        success: true,
        updated: 10,
      };

      mockVaccineDataService.downloadVaccinePDF.mockImplementation(
        async (productId: number, formatId: number) => {
          if (productId === 321) {
            throw new PDFDownloadError(productId);
          } else {
            return `https://publications.saskatchewan.ca/api/v1/products/${productId}/formats/${formatId}`; // Custom return for this case
          }
        }
      );

      // Mock the service methods used in the updateVaccines method
      mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false); // Mock vaccine list not up-to-date
      mockVaccineDataService.updateVaccineList.mockResolvedValue(undefined); // Mock successful update
      // Mock 10 products which will be fine to update
      mockVaccineDataService.compareExternalPDFs.mockResolvedValue(
        Array.from({ length: 10 }, (_, i) => ({
          productId: 11766 + i, // Increment productId for variety
          english: {
            formatId: 123 + i,
            filename: `vaccine${i + 1}_english.pdf`,
          },
          french: { formatId: 456 + i, filename: `vaccine${i + 1}_french.pdf` },
        })) as VaccinePDFData[]
      ); // Mock external PDFs

      const result = await vaccineDataController.updateVaccines();
      console.log(result);

      expect(result).toEqual(expected);
    });

    test("should fail to update 10 vaccines gracefully", async () => {
      const expected = {
        failed: 10,
        success: false,
        updated: 0,
      };

      mockVaccineDataService.downloadVaccinePDF.mockImplementation(
        async (productId: number, formatId: number) => {
          throw new PDFDownloadError(productId);
        }
      );

      // Mock the service methods used in the updateVaccines method
      mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false); // Mock vaccine list not up-to-date
      mockVaccineDataService.updateVaccineList.mockResolvedValue(undefined); // Mock successful update
      // Mock 10 products which will be fine to update
      mockVaccineDataService.compareExternalPDFs.mockResolvedValue(
        Array.from({ length: 10 }, (_, i) => ({
          productId: 11766 + i, // Increment productId for variety
          english: {
            formatId: 123 + i,
            filename: `vaccine${i + 1}_english.pdf`,
          },
          french: { formatId: 456 + i, filename: `vaccine${i + 1}_french.pdf` },
        })) as VaccinePDFData[]
      ); // Mock external PDFs

      const result = await vaccineDataController.updateVaccines();
      console.log(result);

      expect(result).toEqual(expected);
    });

    test("should fail to update 5 vaccines gracefully and succeed updating 5 vaccines", async () => {
      const expected = {
        failed: 5,
        success: false,
        updated: 5,
      };

      mockVaccineDataService.downloadVaccinePDF.mockImplementation(
        async (productId: number, formatId: number) => {
          if (productId % 2 == 0) {
            throw new PDFDownloadError(productId);
          } else {
            return `https://publications.saskatchewan.ca/api/v1/products/${productId}/formats/${formatId}`;
          }
        }
      );

      // Mock the service methods used in the updateVaccines method
      mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false); // Mock vaccine list not up-to-date
      mockVaccineDataService.updateVaccineList.mockResolvedValue(undefined); // Mock successful update
      // Mock 10 products which will be fine to update
      mockVaccineDataService.compareExternalPDFs.mockResolvedValue(
        Array.from({ length: 10 }, (_, i) => ({
          productId: 11766 + i, // Increment productId for variety
          english: {
            formatId: 123 + i,
            filename: `vaccine${i + 1}_english.pdf`,
          },
          french: { formatId: 456 + i, filename: `vaccine${i + 1}_french.pdf` },
        })) as VaccinePDFData[]
      ); // Mock external PDFs

      const result = await vaccineDataController.updateVaccines();
      console.log(result);

      expect(result).toEqual(expected); // Expect the function to return true
    });

    test("Should fail to update 1 vaccine and fail gracefully", async () => {
      const expected = {
        success: false,
        updated: 0,
        failed: 1,
      };

      mockVaccineDataService.downloadVaccinePDF.mockImplementation(
        async (productId: number, formatId: number) => {
          if (productId === 321) {
            throw new PDFDownloadError(productId);
          } else {
            return `https://publications.saskatchewan.ca/api/v1/products/${productId}/formats/${formatId}`; // Custom return for this case
          }
        }
      );

      mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false);
      mockVaccineDataService.compareExternalPDFs.mockResolvedValue([
        {
          productId: 321,
          english: { filename: "", formatId: 123 },
          french: { filename: "", formatId: 456 },
        },
      ] as VaccinePDFData[]);

      const result = await vaccineDataController.updateVaccines();
      expect(result).toEqual(expected);
    });

    test("Should fail to update the second PDF but update the first one successfully", async () => {
      const expected = {
        success: false,
        updated: 1,
        failed: 1,
      };

      mockVaccineDataService.downloadVaccinePDF.mockImplementation(
        async (productId: number, formatId: number) => {
          if (productId === 321) {
            throw new PDFDownloadError(productId);
          } else {
            return `https://publications.saskatchewan.ca/api/v1/products/${productId}/formats/${formatId}`; // Custom return for this case
          }
        }
      );

      mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false);
      mockVaccineDataService.compareExternalPDFs.mockResolvedValue([
        {
          productId: 11766,
          english: { filename: "", formatId: 123 },
          french: { filename: "", formatId: 456 },
        },
        {
          productId: 321,
          english: { filename: "", formatId: 123 },
          french: { filename: "", formatId: 456 },
        },
      ] as VaccinePDFData[]);

      const result = await vaccineDataController.updateVaccines();
      expect(result).toEqual(expected);
    });

    test("should handle errors in updateVaccines gracefully", async () => {
      const expected = {
        success: false,
        updated: 0,
        failed: 1,
      };

      mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false);
      mockVaccineDataService.compareExternalPDFs.mockResolvedValue([
        {
          productId: 11766,
          english: { filename: "", formatId: 123 },
          french: { filename: "", formatId: 456 },
        },
      ] as VaccinePDFData[]);

      mockVaccineDataService.downloadVaccinePDF.mockRejectedValue(
        new PDFDownloadError(11766)
      );

      const result = await vaccineDataController.updateVaccines();

      expect(result).toEqual(expected); // The function still returns true even in case of error
    });
  });

  describe("vaccineListUpToDate() Tests", () => {
    let testableVaccineController: TestableVaccineDataController;

    beforeEach(() => {
      testableVaccineController = new TestableVaccineDataController(
        mockVaccineDataService
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should return false indicating vaccine list out of date", async () => {
      mockVaccineDataService.getVaccineListVersionRemote.mockResolvedValue(2);
      mockVaccineDataService.getVaccineListVersionLocal.mockResolvedValue(1);

      const result = await testableVaccineController.vaccineListUpToDate();

      expect(result).toBe(false); // Expect the function to return false
    });

    test("should return true indicating vaccine list is up to date", async () => {
      mockVaccineDataService.getVaccineListVersionRemote.mockResolvedValue(1);
      mockVaccineDataService.getVaccineListVersionLocal.mockResolvedValue(1);

      const result = await testableVaccineController.vaccineListUpToDate();

      expect(result).toBe(true); // Expect the function to return true
    });

    test("should throw error, the remote version number is less than local", async () => {
      mockVaccineDataService.getVaccineListVersionRemote.mockResolvedValue(1);
      mockVaccineDataService.getVaccineListVersionLocal.mockResolvedValue(2);

      await expect(
        testableVaccineController.vaccineListUpToDate()
      ).rejects.toThrow(VaccineListVersionError); // Expect the funciton to throw an error
    });
  });
  describe("updateVaccineList() Tests", () => {
    let testableVaccineController: TestableVaccineDataController;

    beforeEach(() => {
      testableVaccineController = new TestableVaccineDataController(
        mockVaccineDataService
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should update the vaccine list successfully", async () => {
      const mockVaccineList = {
        timestamp: 1743273741,
        vaccines: [
          {
            vaccineName: "DTaP-IPV-Hib",
            productId: 11766,
            starting: "2 months",
            associatedDiseases: {
              english: [
                "Diphtheria",
                "Tetanus",
                "Pertussis",
                "Polio",
                "Haemophilus Influenzae Type b",
              ],
              french: [
                "La Diphtérie",
                "Le Tétanos",
                "La Coqueluche",
                "La Poliomyélite",
                "l’Haemophilus Influenzae de Type b",
              ],
            },
          },
        ],
      };

      mockVaccineDataService.getVaccineListRemote.mockResolvedValue(
        mockVaccineList
      );
      mockVaccineDataService.storeVaccineListVersionLocal.mockResolvedValue();
      mockVaccineDataService.storeVaccineListLocal.mockResolvedValue();

      await testableVaccineController.updateVaccineList();

      expect(mockVaccineDataService.getVaccineListRemote).toHaveBeenCalled();
      expect(
        mockVaccineDataService.storeVaccineListVersionLocal
      ).toHaveBeenCalledWith(1743273741);
      expect(mockVaccineDataService.storeVaccineListLocal).toHaveBeenCalledWith(
        mockVaccineList.vaccines
      );
    });

    it("should log an error if fetching vaccine list fails", async () => {
      const error = new FetchError("https://text.com/json");
      mockVaccineDataService.getVaccineListRemote.mockRejectedValue(error);

      await testableVaccineController.updateVaccineList();

      expect(logger.error).toHaveBeenCalledWith(
        `Error updating vaccine list: ${error.message}`
      );
    });

    it("should log an error if storing vaccine list version fails", async () => {
      const mockVaccineList = { version: "1.0.0", vaccines: [] };
      mockVaccineDataService.getVaccineListRemote.mockResolvedValue(
        mockVaccineList
      );
      mockVaccineDataService.storeVaccineListVersionLocal.mockRejectedValue(
        new Error("Storage error")
      );

      await testableVaccineController.updateVaccineList();

      expect(logger.error).toHaveBeenCalledWith(
        "Error updating vaccine list: Storage error"
      );
    });

    it("should log an error if storing vaccine list fails", async () => {
      const mockVaccineList = { version: "1", "vaccines": [
    {
      "vaccineName": "DTaP-IPV-Hib",
      "productId": 11766,
      "starting": "2 months",
      "associatedDiseases": {
        "english": [
          "Diphtheria",
          "Tetanus",
          "Pertussis",
          "Polio",
          "Haemophilus Influenzae Type b"
        ],
        "french": [
          "La Diphtérie",
          "Le Tétanos",
          "La Coqueluche",
          "La Poliomyélite",
          "l’Haemophilus Influenzae de Type b"
        ]
      }
    }]};
      mockVaccineDataService.getVaccineListRemote.mockResolvedValue(
        mockVaccineList
      );
      mockVaccineDataService.storeVaccineListVersionLocal.mockResolvedValue();
      mockVaccineDataService.storeVaccineListLocal.mockRejectedValue(
        new Error("Store list error")
      );

      await testableVaccineController.updateVaccineList();

      expect(logger.error).toHaveBeenCalledWith(
        "Error updating vaccine list: Store list error"
      );
    });

    it("should not proceed with storing if fetching vaccine list fails", async () => {
      mockVaccineDataService.getVaccineListRemote.mockRejectedValue(
        new FetchError("https://test.com/json")
      );

      await testableVaccineController.updateVaccineList();

      expect(
        mockVaccineDataService.storeVaccineListVersionLocal
      ).not.toHaveBeenCalled();
      expect(mockVaccineDataService.storeVaccineListLocal).not.toHaveBeenCalled();
    });
  });
  
});

/* COMMENTED OUT ON PURPOSE
  These tests are no valid, they do not fail due to the functions but
  due to the way that they are implemented. They will never pass in this
  form.  


// New test by @Marzi
import { VaccineSheet } from "@/interfaces/iVaccineData";
const mockVaccineDataService: jest.Mocked<VaccineDataService> = {
  updateVaccines: jest.fn(),
  searchVaccines: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Unit Test for VaccineDataController", () => {
  const mockData: VaccineSheet[] = [
    {
      vaccineName: "DTaP-IPV-Hib",
      associatedDiseases: [
        "Diphtheria",
        "Tetanus",
        "Pertussis",
        "Polio",
        "Hib",
      ],
      pdfPath: "DtaP/path.pdf",
      starting: "2 months",
    },
    {
      vaccineName: "Rota",
      associatedDiseases: ["Rota"],
      pdfPath: "Rota/path.pdf",
      starting: "2 months",
    },
    {
      vaccineName: "MMRV",
      associatedDiseases: ["Measles", "Mumps", "Rubella", "Varicella"],
      pdfPath: "Measles/path.pdf",
      starting: "1 year",
    },
  ];
  // this part will make sure that the function can fund the information based the name of vaccine
  it("should return vaccine data based on vaccineName", () => {
    const result = mockVaccineDataService.searchVaccines("Rota", "vaccineName");
    expect(result).toEqual([mockData[1]]);
  });
  // this part will make sure that the function can fund the information based the particular disease
  it("should return vaccine data based on associatedDisease", () => {
    const result = mockVaccineDataService.searchVaccines(
      "Rubella",
      "associatedDiseases"
    );
    expect(result).toEqual([mockData[2]]);
  });
  // this part will make sure that the function will return empty arry if there isn't any match to input
  it("should return empty when could not find any match", () => {
    const result = mockVaccineDataService.searchVaccines(
      "Covid19",
      "vaccineName"
    );
    expect(result).toEqual([]);
  });
  // this part will make sure that the function return all the information when input is null
  it("should return all data if input was empty", () => {
    const result = mockVaccineDataService.searchVaccines(
      "",
      "associatedDiseases"
    );
    expect(result).toEqual(mockData);
  });
  // // this part will make sure that the function is working with both capitilized and lowercase letters
  it("should not be sensitive to capital or not capital letter", () => {
    const result = mockVaccineDataService.searchVaccines(
      "rubella",
      "associatedDiseases"
    );
    expect(result).toEqual([mockData[2]]);
  });
  
});
*/
