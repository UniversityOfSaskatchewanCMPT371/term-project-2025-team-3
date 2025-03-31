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

import { VaccineDataService } from "@/services/vaccineDataService";
import VaccineEntity from "@/myorm/vaccine-entity";
import testVaccineList from "./vaccineListService.data.json";
import * as SQLite from "expo-sqlite";

jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe("VaccineDataService NodeDB Tests", () => {
  let vaccineDataService: VaccineDataService = new VaccineDataService();

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

  describe("vaccineQuery() Tests", () => {
    test("should return vaccines matching the search input", async () => {
      const input = "DTaP";
      const result = await vaccineDataService.vaccineQuery("english", input);

      expect(result).toHaveLength(1);
      expect(result[0].vaccineName).toBe("DTaP-IPV-Hib");
    });

    test("should return everything when no input is provided", async () => {
      const result = await vaccineDataService.vaccineQuery("english");

      expect(result).toHaveLength(11);
      expect(result[0].vaccineName).toBe("DTaP-IPV-Hib");
    });

    test("should return vaccines matching search input with a specific column", async () => {
      const input = "Polio";
      const searchColumn = "associatedDiseases";
      const result = await vaccineDataService.vaccineQuery(
        "english",
        input,
        searchColumn
      );

      expect(result).toHaveLength(2);
      expect(result[0].associatedDiseases).toContain("Polio");
    });

    test("should return vaccines sorted by starting date in descending order", async () => {
      const result = await vaccineDataService.vaccineQuery("english", undefined, undefined, {
        ascending: false,
        column: "starting",
      });

      expect(result[0].vaccineName).toBe("Tdap"); // Adjust based on test data
    });

    test("should return no vaccines if no match is found", async () => {
      const input = "Hepatitis X";
      const result = await vaccineDataService.vaccineQuery("english", input);

      expect(result).toHaveLength(0);
    });
    test("should return vaccines when searching in French", async () => {
        const input = "Poliomyélite"; // Assuming this is the French term in test data
        const result = await vaccineDataService.vaccineQuery("french", input);
    
        expect(result).toHaveLength(2);
        expect(result[0].associatedDiseases).toContain("Poliomyélite");
      });
        
      test("should be case insensitive for vaccine name search", async () => {
        const input = "dtap"; // Lowercase input
        const result = await vaccineDataService.vaccineQuery("english", input);
    
        expect(result).toHaveLength(1);
        expect(result[0].vaccineName).toBe("DTaP-IPV-Hib");
      });
    
      test("should support partial matching of vaccine names", async () => {
        const input = "Hib"; // Partial name match
        const result = await vaccineDataService.vaccineQuery("english", input);
    
        expect(result.length).toBeGreaterThan(0);
        expect(result.some(vaccine => vaccine.vaccineName.includes("Hib"))).toBe(true);
      });

      test("should return vaccines ordered alphabetically by name", async () => {
        const result = await vaccineDataService.vaccineQuery("english", undefined, undefined, {
          ascending: true,
          column: "vaccineName",
        });
    
        expect(result.length).toBeGreaterThan(1);
        expect(result.map(v => v.vaccineName)).toEqual(
          [...result.map(v => v.vaccineName)].sort()
        );
      });
      test("should return vaccines ordered in descending order by name", async () => {
        const result = await vaccineDataService.vaccineQuery("english", undefined, undefined, {
          ascending: false,
          column: "vaccineName",
        });
    
      
        expect(result.length).toBeGreaterThan(1);
        expect(result.map(v => v.vaccineName)).toEqual(
          [...result.map(v => v.vaccineName)].sort().reverse()
        );
      });
      test("should return vaccines ordered by starting date in ascending order", async () => {
        const result = await vaccineDataService.vaccineQuery("english", undefined, undefined, {
          ascending: true,
          column: "starting",
        });
    
        expect(result.length).toBeGreaterThan(1);
        expect(result.map(v => v.starting)).toEqual(
          [...result.map(v => v.starting)].sort()
        );
      });
      test("should return vaccines ordered by starting date in descending order", async () => {
        const result = await vaccineDataService.vaccineQuery("english", undefined, undefined, {
          ascending: false,
          column: "starting",
        });
    
        expect(result.length).toBeGreaterThan(1);
        expect(result.map(v => v.starting)).toEqual(
          [...result.map(v => v.starting)].sort().reverse()
        );
      });
      test("should return results when searching by associated diseases in French", async () => {
        const input = "Rougeole"; // Measles in French
        const result = await vaccineDataService.vaccineQuery("french", input, "associatedDiseases");
    
        expect(result.length).toBeGreaterThan(0);
        expect(result.some(vaccine => vaccine.associatedDiseases.includes("Rougeole"))).toBe(true);
      });
    
      test("should return no results if language is mismatched", async () => {
        const input = "Rougeole"; // Measles in French
        const result = await vaccineDataService.vaccineQuery("english", input, "associatedDiseases");
    
        expect(result.length).toBe(0);
      });
      test("should return results for partial disease names", async () => {
        const input = "Pol"; // Partial match for "Polio"
        const result = await vaccineDataService.vaccineQuery("english", input, "associatedDiseases");
    
        expect(result.length).toBeGreaterThan(0);
        expect(result.some(vaccine => vaccine.associatedDiseases.includes("Polio"))).toBe(true);
      });
    
      test("should return vaccines when searching for case-insensitive input", async () => {
        const input = "dtap";
        const result = await vaccineDataService.vaccineQuery("english", input);
    
        expect(result.length).toBeGreaterThan(0);
        expect(result.some(vaccine => vaccine.vaccineName.toLowerCase().includes("dtap"))).toBe(true);
      });
    
  });
  
});
