import { iVaccineDataService } from '../iVaccineData';

const mockVaccineDataService: jest.Mocked<iVaccineDataService> = {
    downloadVaccinePDF: jest.fn(),
    compareExternalPDFs: jest.fn(),
    updateLocalPDFFilenames: jest.fn(),
    storeVaccineListLocal: jest.fn(),
    storeVaccineListVersionLocal: jest.fn(),
    getVaccineListVersionLocal: jest.fn(),
    getVaccineListRemote: jest.fn(),
    vaccineQuery: jest.fn()
};

beforeEach(() => {
    jest.clearAllMocks();
});

// mock the logger to test its calls
jest.mock("@/utils/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    debug: jest.fn(),
  }));
  

describe('Unit tests for iVaccineData', () => {
    
    it('should download a vaccine PDF', async () => {
        mockVaccineDataService.downloadVaccinePDF.mockResolvedValue("path/to/pdf");
        const pdfPath = await mockVaccineDataService.downloadVaccinePDF(1, 1);
        expect(pdfPath).toBe("path/to/pdf");
    });

    it('should compare external PDFs', async () => {
        const mockData = [{ productId: 1, english: { filename: "test_en.pdf" }, french: { filename: "test_fr.pdf" }}];
        mockVaccineDataService.compareExternalPDFs.mockResolvedValue(mockData);
        const result = await mockVaccineDataService.compareExternalPDFs();
        expect(result).toEqual(mockData);
    });

    it('should update local PDF filenames', async () => {
        await mockVaccineDataService.updateLocalPDFFilenames(1, "new_en.pdf", "new_fr.pdf");
        expect(mockVaccineDataService.updateLocalPDFFilenames).toHaveBeenCalledWith(1, "new_en.pdf", "new_fr.pdf");
    });

    it('should store vaccine list locally', async () => {
        const mockVaccineList = [{
            vaccineName: "Test Vaccine",
            productId: 1,
            starting: "12 months",
            associatedDiseases: {
                english: ["Disease 1"],
                french: ["Maladie 1"]
            }
        }];
        await mockVaccineDataService.storeVaccineListLocal(mockVaccineList);
        expect(mockVaccineDataService.storeVaccineListLocal).toHaveBeenCalledWith(mockVaccineList);
    });

    it('should store vaccine list version locally', async () => {
        await mockVaccineDataService.storeVaccineListVersionLocal(1);
        expect(mockVaccineDataService.storeVaccineListVersionLocal).toHaveBeenCalledWith(1);
    });

    it('should get the local version of the vaccine list', async () => {
        mockVaccineDataService.getVaccineListVersionLocal.mockResolvedValue(1);
        const version = await mockVaccineDataService.getVaccineListVersionLocal();
        expect(version).toBe(1);
    });

    it('should get the vaccine list from remote', async () => {
        const mockResponse = { version: 1, vaccines: [{ vaccineName: "Test Vaccine", productId: 1, starting: "12 months", associatedDiseases: { english: ["Disease 1"], french: ["Maladie 1"] } }] };
        mockVaccineDataService.getVaccineListRemote.mockResolvedValue(mockResponse);
        const response = await mockVaccineDataService.getVaccineListRemote();
        expect(response).toEqual(mockResponse);
    });

    it('should query vaccines', () => {
        const mockResponse = [{ vaccineName: "Test Vaccine", associatedDiseases: ["Disease 1"], pdfPath: "path/to/pdf", starting: "12 months" }];
        mockVaccineDataService.vaccineQuery.mockReturnValue(mockResponse);
        const result = mockVaccineDataService.vaccineQuery("Test", "english");
        expect(result).toEqual(mockResponse);
    });
});
