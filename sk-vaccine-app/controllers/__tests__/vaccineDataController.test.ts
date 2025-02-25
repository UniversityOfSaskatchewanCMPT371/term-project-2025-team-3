import VaccineDataController from "../VaccineDataController";
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

// Mock the logger
jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe("VaccineDataController", () => {
  let vaccineDataController: VaccineDataController;
  let mockVaccineDataService: jest.Mocked<VaccineDataService>;

  beforeEach(() => {
    // Initialize the VaccineDataController and automatically use the mocked VaccineDataService
    vaccineDataController = new VaccineDataController();
    mockVaccineDataService = vaccineDataController["vaccineDataService"] as jest.Mocked<VaccineDataService>;
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear any mock calls after each test
  });

  test("should return true if the vaccine list is updated", async () => {
    console.log("Calling updateVaccines...");

    // Mock the methods used in the updateVaccines method
    mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false); // Simulating outdated list
    mockVaccineDataService.updateVaccineList.mockResolvedValue(undefined); // Simulating success
    mockVaccineDataService.compareExternalPDFs.mockResolvedValue([
      {
        productId: 1,
        english: { formatId: 123, filename: "vaccine1_english.pdf" },
        french: { formatId: 456, filename: "vaccine1_french.pdf" },
      },
    ] as VaccinePDFData[]);

    // Simulate the download and update of PDF
    mockVaccineDataService.downloadVaccinePDF.mockResolvedValue("path/to/file.pdf");
    mockVaccineDataService.updateLocalPDFFilenames.mockResolvedValue(undefined);

    // Add a console log to see the flow
    console.log("Before calling updateVaccineList");

    // Call the method
    const result = await vaccineDataController.updateVaccines();

    // Check if updateVaccineList is being called
    console.log("Mock updateVaccineList call count:", mockVaccineDataService.updateVaccineList.mock.calls.length);

    console.log("Result of updateVaccines:", result);

    // Ensure that the necessary methods were called
    expect(result).toBe(true);
    expect(mockVaccineDataService.vaccineListUpToDate).toHaveBeenCalled();
    expect(mockVaccineDataService.updateVaccineList).toHaveBeenCalled();
    expect(mockVaccineDataService.downloadVaccinePDF).toHaveBeenCalled();
    expect(mockVaccineDataService.updateLocalPDFFilenames).toHaveBeenCalled();
  });

  test("should handle errors in updateVaccines gracefully", async () => {
    console.log("Calling updateVaccines (error handling)...");

    // Mock an error during the PDF download
    mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false); // Simulate outdated list
    mockVaccineDataService.compareExternalPDFs.mockResolvedValue([
      { productId: 1, english: { filename: "", formatId: 123 }, french: { filename: "", formatId: 456 } },
    ] as VaccinePDFData[]);

    mockVaccineDataService.downloadVaccinePDF.mockRejectedValue(new Error("Download error"));

    // Add a console log to see the flow
    console.log("Before calling updateVaccines (error handling)");

    // Call the method
    const result = await vaccineDataController.updateVaccines();

    console.log("Result of updateVaccines (error handling):", result);

    // Ensure that the error was logged, and the return value is still true (as expected by the method)
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
