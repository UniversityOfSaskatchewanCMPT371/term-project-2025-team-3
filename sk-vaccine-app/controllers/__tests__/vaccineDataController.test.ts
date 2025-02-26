import VaccineDataController from "../vaccineDataController";
import VaccineDataService from "../../services/vaccineDataService";
import VaccinePDFData  from "../interfaces/iVaccineData";
import logger from "../../utils/logger";

// Mock the VaccineDataService class
jest.mock("../../services/vaccineDataService", () => {
  return jest.fn().mockImplementation(() => ({
    vaccineListUpToDate: jest.fn(),
    updateVaccineList: jest.fn(),
    compareExternalPDFs: jest.fn(),
    downloadVaccinePDF: jest.fn(),
    updateLocalPDFFilenames: jest.fn(),
    getVaccineListVersionRemote: jest.fn(),
    getVaccineListVersionLocal: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }));
});

// Mocking the logger
jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe("VaccineDataController", () => {
  let vaccineDataController: VaccineDataController;
  let mockVaccineDataService: jest.Mocked<VaccineDataService>;

  beforeEach(() => {
    // Initialize the VaccineDataController and use the mocked VaccineDataService
    vaccineDataController = new VaccineDataController();
    mockVaccineDataService = vaccineDataController["vaccineDataService"] as jest.Mocked<VaccineDataService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return true if the vaccine list is updated", async () => {
    console.log("Calling updateVaccines...");

    // Mock the methods used in the updateVaccines method
    mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false);
    mockVaccineDataService.updateVaccineList.mockResolvedValue(undefined);
    mockVaccineDataService.compareExternalPDFs.mockResolvedValue([
      {
        productId: 1,
        english: { formatId: 123, filename: "vaccine1_english.pdf" },
        french: { formatId: 456, filename: "vaccine1_french.pdf" },
      },
    ] as VaccinePDFData[]);

    // downloading and updating the PDF
    mockVaccineDataService.downloadVaccinePDF.mockResolvedValue("path/to/file.pdf");
    mockVaccineDataService.updateLocalPDFFilenames.mockResolvedValue(undefined);

    // Adding a console log
    console.log("Before calling updateVaccineList");


    const result = await vaccineDataController.updateVaccines();


    console.log("Mock updateVaccineList call count:", mockVaccineDataService.updateVaccineList.mock.calls.length);

    console.log("Result of updateVaccines:", result);


    expect(result).toBe(true);
    expect(mockVaccineDataService.vaccineListUpToDate).toHaveBeenCalled();
    expect(mockVaccineDataService.updateVaccineList).toHaveBeenCalled();
    expect(mockVaccineDataService.downloadVaccinePDF).toHaveBeenCalled();
    expect(mockVaccineDataService.updateLocalPDFFilenames).toHaveBeenCalled();
  });

  test("should handle errors in updateVaccines gracefully", async () => {
    console.log("Calling updateVaccines (error handling)...");

    // Mock an error during the PDF download
    mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false);
    mockVaccineDataService.compareExternalPDFs.mockResolvedValue([
      { productId: 1, english: { filename: "", formatId: 123 }, french: { filename: "", formatId: 456 } },
    ] as VaccinePDFData[]);

    mockVaccineDataService.downloadVaccinePDF.mockRejectedValue(new Error("Download error"));


    console.log("Before calling updateVaccines (error handling)");


    const result = await vaccineDataController.updateVaccines();

    console.log("Result of updateVaccines (error handling):", result);

    // Ensure that the error was logged, and the return value is true
    expect(result).toBe(true);
    expect(mockVaccineDataService.downloadVaccinePDF).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith("Error updating pdfs in updateVaccines");
  });

  test("should check if the vaccine list is up to date", async () => {
    // Mock the vaccineListUpToDate method
    mockVaccineDataService.getVaccineListVersionRemote.mockResolvedValue(2);
    mockVaccineDataService.getVaccineListVersionLocal.mockResolvedValue(1);

    const result = await vaccineDataController["vaccineListUpToDate"]();

    expect(result).toBe(false); // Remote version is higher, list is not up to date
  });
});
