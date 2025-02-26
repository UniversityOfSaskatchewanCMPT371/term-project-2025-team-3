import { VaccineDataService } from "@/services/vaccineDataService";
import VaccineEntity from "@/myorm/vaccine-entity";
import logger from "@/utils/logger";

// Mock VaccineEntity
jest.mock("@/myorm/vaccine-entity", () => {
    const actualModule = jest.requireActual("@/myorm/base-entity");
    
    class MockVaccineEntity extends actualModule.default {
        static find = jest.fn();
        static count = jest.fn();
        static clear = jest.fn();
        static queryObjs = jest.fn();
        static getColumns = jest.fn();
        save = jest.fn();
    }
  
    return {
        __esModule: true,
        ...actualModule,
        default: MockVaccineEntity,
    };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
    documentDirectory: '',
    downloadAsync: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Unit tests for VaccineDataService.getVaccineListVersionRemote', () => {
    it('should get remote vaccine list version', async () => {
        const mockResponse = { version: 1 }; // Match the version in the data file
        const tempJson = require('@/services/__tests__/vaccineListService.data.json'); // Mocking the json file
        
        jest.spyOn(global, 'fetch').mockResolvedValue({
            json: jest.fn().mockResolvedValue(tempJson)
        } as any);

        const version = await (new VaccineDataService()).getVaccineListVersionRemote();
        
        expect(version).toEqual(mockResponse.version);
        expect(global.fetch).toHaveBeenCalled();
    });
});

describe('Unit tests for VaccineDataService.getVaccineListRemote', () => {
    it('should get remote vaccine list', async () => {
        const tempJson = require('@/services/__tests__/vaccineListService.data.json'); // Mocking the json file
        
        jest.spyOn(global, 'fetch').mockResolvedValue({
            json: jest.fn().mockResolvedValue(tempJson)
        } as any);

        const vaccineList = await (new VaccineDataService()).getVaccineListRemote();
        
        expect(vaccineList).toEqual(tempJson);
        expect(global.fetch).toHaveBeenCalled();
    });
});

describe('Unit tests for VaccineDataService.storeVaccineListLocal', () => {
    it('should store vaccine list locally', async () => {
        const mockVaccineList = [
            {
                vaccineName: 'Vaccine A',
                productId: 123,
                starting: '2025-01-01',
                associatedDiseases: {
                    english: ['Disease A'],
                    french: ['Disease B']
                }
            }
        ];

        VaccineEntity.query = jest.fn().mockResolvedValue(undefined);

        await (new VaccineDataService()).storeVaccineListLocal(mockVaccineList as any);
        
        expect(VaccineEntity.query).toHaveBeenCalled();
    });
});

describe('Unit tests for VaccineDataService.compareExternalPDFs', () => {
    it('should compare external PDFs', async () => {
        const mockProductIDs = [{ productId: 123, englishFormatId: 1, frenchFormatId: 2 }];
        const mockProductJSON = {
            productFormats: [
                { digitalAttributes: { fileName: 'file1.pdf' } },
                { digitalAttributes: { fileName: 'file2.pdf' } }
            ]
        };
        jest.spyOn(VaccineDataService.prototype as any, "getProductIDs").mockResolvedValue(mockProductIDs);
        jest.spyOn(global, 'fetch').mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockProductJSON)
        } as any);
        jest.spyOn(VaccineDataService.prototype, 'getLocalPDFFilenames').mockResolvedValue({
            englishFilename: 'local_file1.pdf',
            frenchFilename: 'local_file2.pdf'
        });

        const result = await (new VaccineDataService()).compareExternalPDFs();
        
        expect(result).toEqual([
            {
                productId: 123,
                english: { filename: 'file1.pdf', formatId: 1 },
                french: { filename: 'file2.pdf', formatId: 2 }
            }
        ]);
        expect((VaccineDataService.prototype as any).getProductIDs).toHaveBeenCalled();
        expect(global.fetch).toHaveBeenCalled();
        expect(VaccineDataService.prototype.getLocalPDFFilenames).toHaveBeenCalled();
    });
});


describe('Unit tests for VaccineDataService.getLocalPDFFilenames', () => {
    it('should get local PDF filenames', async () => {
        const mockFilenames = { englishFilename: 'file1.pdf', frenchFilename: 'file2.pdf' };
        VaccineEntity.query = jest.fn().mockResolvedValue(mockFilenames);

        const result = await (new VaccineDataService()).getLocalPDFFilenames(123);
        
        expect(result).toEqual(mockFilenames);
        expect(VaccineEntity.query).toHaveBeenCalled();
    });
});

describe('Unit tests for VaccineDataService.updateLocalPDFFilenames', () => {
    it('should update local PDF filenames', async () => {
        VaccineEntity.query = jest.fn().mockResolvedValue(undefined);

        await (new VaccineDataService()).updateLocalPDFFilenames(123, 'file1.pdf', 'file2.pdf');
        
        expect(VaccineEntity.query).toHaveBeenCalled();
    }, 10000); // Increased timeout for long-running test
});

describe('Unit tests for VaccineDataService.getVaccineSheets', () => {
    it('should fetch vaccine sheets in English', async () => {
        const mockVaccineSheets = [
            { vaccineName: 'Vaccine A', associatedDiseases: 'Disease A', pdfPath: 'path/to/pdfA', starting: '2025-01-01' }
        ];
        VaccineEntity.query = jest.fn().mockResolvedValue(mockVaccineSheets);
        
        const result = await (new VaccineDataService()).getVaccineSheets('english');
        
        expect(result).toEqual(mockVaccineSheets);
        expect(VaccineEntity.query).toHaveBeenCalled();
    });
});

describe('Unit tests for VaccineDataService.storeVaccineListVersionLocal', () => {
    it('should store vaccine list version locally', async () => {
        const mockSetItem = jest.fn();
        require('@react-native-async-storage/async-storage').setItem = mockSetItem;

        await (new VaccineDataService()).storeVaccineListVersionLocal(1);
        
        expect(mockSetItem).toHaveBeenCalledWith("vaccine_list_version", "1");
    });
});

describe('Unit tests for VaccineDataService.getVaccineListVersionLocal', () => {
    it('should fetch vaccine list version locally', async () => {
        const mockGetItem = jest.fn().mockResolvedValue("1");
        require('@react-native-async-storage/async-storage').getItem = mockGetItem;

        const result = await (new VaccineDataService()).getVaccineListVersionLocal();
        
        expect(result).toEqual(1);
        expect(mockGetItem).toHaveBeenCalled();
    });

    it('should handle missing local vaccine list version', async () => {
        const mockGetItem = jest.fn().mockResolvedValue(null);
        require('@react-native-async-storage/async-storage').getItem = mockGetItem;

        const result = await (new VaccineDataService()).getVaccineListVersionLocal();
        
        expect(result).toEqual(-1);
        expect(mockGetItem).toHaveBeenCalled();
    });
});

describe('Unit tests for VaccineDataService.downloadVaccinePDF', () => {
    it('should download vaccine PDF', async () => {
        const mockDownloadAsync = jest.fn().mockResolvedValue({ uri: 'path/to/downloaded/pdf' });
        require('expo-file-system').downloadAsync = mockDownloadAsync;
        
        const result = await (new VaccineDataService()).downloadVaccinePDF(123, 456);
        
        expect(result).toEqual('path/to/downloaded/pdf');
        expect(mockDownloadAsync).toHaveBeenCalled();
    });

    it('should handle download vaccine PDF failure', async () => {
        const mockDownloadAsync = jest.fn().mockRejectedValue(new Error("Download error"));
        require('expo-file-system').downloadAsync = mockDownloadAsync;

        const result = await (new VaccineDataService()).downloadVaccinePDF(123, 456);
        
        expect(result).toEqual('');
        expect(mockDownloadAsync).toHaveBeenCalled();
    });
});
