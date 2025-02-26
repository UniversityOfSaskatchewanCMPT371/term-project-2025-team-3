import  VaccineDataController  from "../vaccineDataController";  // Correct path
import { VaccineDataService } from "../../services/vaccineDataService"; // Correct import
import VaccinePDFData from "../interfaces/iVaccineData";
import logger from "../../utils/logger";

// Mocking the logger
jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

// Mock the VaccineDataService class
jest.mock("../../services/vaccineDataService");

describe("VaccineDataController", () => {
  let vaccineDataController: VaccineDataController;
  let mockVaccineDataService: jest.Mocked<VaccineDataService>;

  beforeEach(() => {
    // Create a mocked instance of VaccineDataService
    mockVaccineDataService = new VaccineDataService() as jest.Mocked<VaccineDataService>;

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

  test("should return true if the vaccine list is updated", async () => {
    // Mock the service methods used in the updateVaccines method
    mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false);  // Mock vaccine list not up-to-date
    mockVaccineDataService.updateVaccineList.mockResolvedValue(undefined);  // Mock successful update
    mockVaccineDataService.compareExternalPDFs.mockResolvedValue([
      {
        productId: 1,
        english: { formatId: 123, filename: "vaccine1_english.pdf" },
        french: { formatId: 456, filename: "vaccine1_french.pdf" },
      },
    ] as VaccinePDFData[]); // Mock external PDFs

    // Mock the downloading and updating of the PDF
    mockVaccineDataService.downloadVaccinePDF.mockResolvedValue("path/to/file.pdf");
    mockVaccineDataService.updateLocalPDFFilenames.mockResolvedValue(undefined);
    mockVaccineDataService.getLocalPDFFilenames.mockResolvedValue(["local_pdf_1.pdf", "local_pdf_2.pdf"]); // Mock the local PDF filenames

    const result = await vaccineDataController.updateVaccines();

    expect(result).toBe(true);  // Expect the function to return true
    expect(mockVaccineDataService.vaccineListUpToDate).toHaveBeenCalled();
    expect(mockVaccineDataService.updateVaccineList).toHaveBeenCalled();
    expect(mockVaccineDataService.compareExternalPDFs).toHaveBeenCalled();
    expect(mockVaccineDataService.downloadVaccinePDF).toHaveBeenCalled();
    expect(mockVaccineDataService.updateLocalPDFFilenames).toHaveBeenCalled();
    expect(mockVaccineDataService.getLocalPDFFilenames).toHaveBeenCalled(); // Ensure getLocalPDFFilenames is called
  });

  test("should handle errors in updateVaccines gracefully", async () => {
    mockVaccineDataService.vaccineListUpToDate.mockResolvedValue(false);
    mockVaccineDataService.compareExternalPDFs.mockResolvedValue([
      { productId: 1, english: { filename: "", formatId: 123 }, french: { filename: "", formatId: 456 } },
    ] as VaccinePDFData[]);

    mockVaccineDataService.downloadVaccinePDF.mockRejectedValue(new Error("Download error"));

    const result = await vaccineDataController.updateVaccines();

    expect(result).toBe(true);  // The function still returns true even in case of error
    expect(mockVaccineDataService.downloadVaccinePDF).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith("Error updating pdfs in updateVaccines");
  });

  test("should check if the vaccine list is up to date", async () => {
    mockVaccineDataService.getVaccineListVersionRemote.mockResolvedValue(2);
    mockVaccineDataService.getVaccineListVersionLocal.mockResolvedValue(1);

    const result = await vaccineDataController["vaccineListUpToDate"]();  // Access private method if needed

    expect(result).toBe(false);  // Remote version is higher, list is not up to date
  });
});
