// Mock SQLite module
import { mockdb } from "../../myorm/__tests__/mock-db";
jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn().mockReturnValue({
    execAsync: mockdb.execAsync,
    getAllAsync: mockdb.getAllAsync,
    getFirstAsync: mockdb.getFirstAsync,
    runAsync: mockdb.runAsync,
    execSync: mockdb.execSync,
    getAllSync: mockdb.getAllSync,
  } as unknown as SQLite.SQLiteDatabase),
}));

import VaccineDataController from "@/controllers/vaccineDataController";
import { VaccineDataService } from "@/services/vaccineDataService";
import VaccineEntity from "@/myorm/vaccine-entity";
import testVaccineList from "./vaccineListService.data.json";
import * as SQLite from "expo-sqlite";

// mock the logger to test its calls
jest.mock("@/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn(),
}));


describe("VaccineDataController NodeDB Tests", () => {
  let vaccineDataService: VaccineDataService = new VaccineDataService();
  let vaccineDataController: VaccineDataController = new VaccineDataController(
    vaccineDataService
  );

  beforeAll(async () => {
    for (let vaccine of testVaccineList.vaccines) {
      const vaccineEntry = new VaccineEntity({
        vaccineName: vaccine.vaccineName,
        productId: vaccine.productId,
        starting: vaccine.starting,
        associatedDiseasesEnglish: vaccine.associatedDiseases.english,
        associatedDiseasesFrench: vaccine.associatedDiseases.french,
      });
      await vaccineEntry.save();
    }
  });

  describe("searchVaccines() Tests", () => {
    test("should return vaccines matching the search input", async () => {
      const input = "DTaP";
      const result = await vaccineDataController.searchVaccines(input);

      expect(result).toHaveLength(1);
      expect(result[0].vaccineName).toBe("DTaP-IPV-Hib");
    });

    test("should return everthing with no input", async () => {
        const result = await vaccineDataController.searchVaccines();
  
        expect(result).toHaveLength(11);
        expect(result[0].vaccineName).toBe("DTaP-IPV-Hib");
      });

    test("should return vaccines matching the search input with a specific field", async () => {
      const input = "Polio";
      const field = "associatedDiseases";
      const result = await vaccineDataController.searchVaccines(input, field);

      console.log(result);
      expect(result).toHaveLength(2);
      expect(result[0].associatedDiseases).toContain("Polio");
    });

    test("should return vaccines with matching disease", async () => {
        const input = "Polio";
        const result = await vaccineDataController.searchVaccines(input);
  
        console.log(result);
        expect(result).toHaveLength(2);
        expect(result[0].associatedDiseases).toContain("Polio");
      });

    test("should return no vaccines if no match is found", async () => {
      const input = "Hepatitis X";
      const result = await vaccineDataController.searchVaccines(input);

      expect(result).toHaveLength(0);
    });
  });
});
