import { VaccineDataService } from "@/services/vaccineDataService";
import VaccineEntity from "@/myorm/vaccine-entity";
import logger from "@/utils/logger";
import { FetchError } from "@/utils/ErrorTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

// Mock VaccineEntity
jest.mock("@/myorm/vaccine-entity", () => {
  const actualModule = jest.requireActual("@/myorm/base-entity");
  
  class MockVaccineEntity extends actualModule.default {
    static query = jest.fn();
    static findOne = jest.fn();
    static queryObjs = jest.fn();
    save = jest.fn().mockResolvedValue(true);
  }

  return {
    __esModule: true,
    ...actualModule,
    default: MockVaccineEntity,
  };
});

// Mock logger
jest.mock("@/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn(),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

// Mock FileSystem
jest.mock("expo-file-system", () => ({
  documentDirectory: "mock-directory/",
  downloadAsync: jest.fn(),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  readDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("VaccineDataService", () => {
  let service: VaccineDataService;

  beforeEach(() => {
    service = new VaccineDataService();
  });

  describe('getVaccineListVersionRemote', () => {
    it('should get remote vaccine list version', async () => {
      const mockResponse = { timestamp: 1743273741 };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const version = await service.getVaccineListVersionRemote();
      expect(version).toEqual(mockResponse.timestamp);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getVaccineListRemote', () => {
    it('should get remote vaccine list', async () => {
      const mockResponse = { 
        timestamp: 123, 
        vaccines: [{ vaccineName: "Test Vaccine" }] 
      };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await service.getVaccineListRemote();
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should throw FetchError on failure', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
      await expect(service.getVaccineListRemote()).rejects.toThrow(FetchError);
    });
  });

  describe('storeVaccineListLocal', () => {
    it('should store vaccine list locally', async () => {
      const mockVaccineList = [{
        vaccineName: 'Vaccine A',
        productId: 123,
        starting: '2025-01-01',
        associatedDiseases: {
          english: ['Disease A'],
          french: ['Disease B']
        }
      }];

      await service.storeVaccineListLocal(mockVaccineList as any);
      expect(VaccineEntity.prototype.save).toHaveBeenCalled();
    });
  });

  describe('compareExternalPDFs', () => {
    it('should compare external PDFs', async () => {
      const mockProductIDs = [{ productId: 123, englishFormatId: 1, frenchFormatId: 2 }];
      const mockProductJSON = {
        productFormats: [
          { digitalAttributes: { fileName: 'file1.pdf', productFormatId: 1 } },
          { digitalAttributes: { fileName: 'file2.pdf', productFormatId: 2 } }
        ]
      };
      
      jest.spyOn(service as any, "getProductIDs").mockResolvedValue(mockProductIDs);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockProductJSON)
      });
      
      jest.spyOn(service, 'getLocalPDFFilenames').mockResolvedValue({
        englishPDFFilename: 'file1.pdf',
        frenchPDFFilename: 'file2.pdf'
      } as any);

      const result = await service.compareExternalPDFs();
      expect(result).toEqual([{
        productId: 123,
        english: { filename: 'file1.pdf', formatId: undefined },
        french: { filename: 'file2.pdf', formatId: undefined }
      }]);
    });
  });

  describe('getLocalPDFFilenames', () => {
    it('should get local PDF filenames', async () => {
      const mockFilenames = { 
        englishPDFFilename: 'file1.pdf',
        frenchPDFFilename: 'file2.pdf'
      };
      (VaccineEntity.findOne as jest.Mock).mockResolvedValue(mockFilenames);

      const result = await service.getLocalPDFFilenames(123);
      expect(result).toEqual(mockFilenames);
    });
  });

  describe('updateLocalPDFFilenames', () => {
    it('should update local PDF filenames', async () => {
      const mockVaccine = { 
        englishPDFFilename: 'old.pdf',
        frenchPDFFilename: 'old.pdf',
        save: jest.fn().mockResolvedValue(true)
      };
      (VaccineEntity.findOne as jest.Mock).mockResolvedValue(mockVaccine);

      await service.updateLocalPDFFilenames(123, 'new-en.pdf', 'new-fr.pdf');
      expect(mockVaccine.save).toHaveBeenCalled();
    });
  });

  describe('getVaccineSheets', () => {
    it('should fetch vaccine sheets in English', async () => {
      const mockVaccineSheets = [{
        vaccineName: 'Vaccine A', 
        associatedDiseases: 'Disease A', 
        pdfPath: 'path/to/pdfA', 
        starting: '2025-01-01' 
      }];
      (VaccineEntity.query as jest.Mock).mockResolvedValue(mockVaccineSheets);
      
      const result = await service.getVaccineSheets('english');
      expect(result).toEqual(mockVaccineSheets);
    });
  });

  describe('storeVaccineListVersionLocal', () => {
    it('should store vaccine list version locally', async () => {
      await service.storeVaccineListVersionLocal(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("vaccine_list_version", "1");
    });
  });

  describe('getVaccineListVersionLocal', () => {
    it('should fetch vaccine list version locally', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("1");
      const result = await service.getVaccineListVersionLocal();
      expect(result).toEqual(1);
    });

    it('should handle missing local vaccine list version', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await service.getVaccineListVersionLocal();
      expect(result).toEqual(-1);
    });
  });


});