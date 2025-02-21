import ClinicData, { ClinicArray, Clinic } from "@/services/clinicDataService";
import { EmptyStorageError, InvalidArgumentError } from "@/utils/ErrorTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logger from "@/utils/logger";
import BaseEntity from "@/myorm/base-entity";
import * as SQLite from 'expo-sqlite';

const mockdb = {
  execAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  execSync: jest.fn(),
  getAllSync: jest.fn()
} as unknown as SQLite.SQLiteDatabase;
BaseEntity.db = mockdb;

import ClinicEntity from "@/myorm/clinic-entity";







jest.mock("@/myorm/base-entity", () => {
const actualModule = jest.requireActual("@/myorm/base-entity");
  return {
    __esModule: true,
    ...actualModule,
    default: jest.fn().mockImplementation(() => {
      return {
        save: jest.fn(),
      };
    }),
    find: jest.fn(),
    count: jest.fn(),
    clear: jest.fn(),
  };
});


describe("Unit tests for ClinicData", () => {
  let clinicData: ClinicData;
  let testClinicArray: ClinicArray
  beforeEach(() => {
    const testClinics: Clinic[] = [
      {
        latitude: 12.345,
        longitude: 67.89,
        serviceArea: "Test 1",
        name: "Test 1 Clinic",
        address: "1 Test Street",
        contactInfo: "306-555-1234",
        hours: "8 AM - 6 PM",
        services: ["Child", "Adult"],
      },
      {
        latitude: 67.89,
        longitude: 12.345,
        serviceArea: "Test 2",
        name: "Test 2 Doctor's office",
        address: "2 Test Ave",
        contactInfo: "306-555-4321",
        hours: "9 AM - 7 PM",
        services: ["Child"],
      }
      
    ];
    const timeStamp = new Date("2025-02-15T12:00:00Z");
    testClinicArray = new ClinicArray(testClinics, timeStamp);
    clinicData = new ClinicData();


    // TODO set up database




  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("storeClinics", () => {
    it("should store clinics without errors", async () => {
      clinicData.storeClinics(testClinicArray);
    });
  });

  describe("getClinics", () => {
    it("should return a ClinicArray when data is available", async () => {
    });

    it("should throw EmptyStorageError if no clinic data is stored", async () => {
    });
  });

  describe("searchClinics", () => {
    it("should return matching clinics when valid search parameters are provided", async () => {
    });

    it("should return matching clinics when only searchValue is provided", async () => {
    });

    it("should throw EmptyStorageError when storage is empty", async () => {
    });

    it("should throw InvalidArgumentError when an invalid column is provided", async () => {
    });
  });

  describe("getTimeStamp", () => {
    it("should return a valid Date when a timestamp exists", async () => {

    });

    it("should throw EmptyStorageError when no timestamp exists", async () => {
    });
  });

  describe("isValidTextColumn", () => {
    it("should return true for a valid text column name", async () => {
    });

    it("should return false for an invalid text column name", async () => {
    });
  });

  describe("getTextColumns", () => {
    it("should return an array of valid text column names", async () => {
    });
  });

  describe("isStorageEmpty", () => {
    it("should return true when storage is empty", async () => {
    });

    it("should return false when storage contains clinic data", async () => {
    });
  });

  describe("emptyStorage", () => {
    it("should delete all stored clinic data and timestamp", async () => {
    });
  });
});
