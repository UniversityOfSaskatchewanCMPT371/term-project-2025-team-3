import VaccineDataController from "@/controllers/vaccineDataController";
import { VaccineDataService } from "@/services/vaccineDataService";
import { VaccinePDFData } from "@/interfaces/iVaccineData";
import { PDFDownloadError, VaccineListVersionError } from "@/utils/ErrorTypes";
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

describe("VaccineDataController Tests", () => {
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
            return `https://publications.saskatchewan.ca/api/v1/products/${productId}/formats/${formatId}`; // Custom return for this case
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
});
