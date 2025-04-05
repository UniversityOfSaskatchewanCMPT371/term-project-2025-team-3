import ClinicDataService, { ClinicArray, Clinic, CLINIC_TIMESTAMP_KEY } from "@/services/clinicDataService";
import { EmptyStorageError, InvalidArgumentError } from "@/utils/ErrorTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite"; // Importing expo-sqlite
import { ColumnMetadata } from "@/myorm/decorators";

// Mock SQLite methods
jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
    execSync: jest.fn(),
    getAllSync: jest.fn(),
  })),
}));

// Mock AsyncStorage methods
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// mock the logger to test its calls
// Mock AsyncStorage methods
// mock the logger to test its calls
jest.mock("@/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn(),
}));

// Mock ClinicEntity
jest.mock("@/myorm/clinic-entity", () => {
  class MockClinicEntity {
    static find = jest.fn();
    static count = jest.fn();
    static clear = jest.fn();
    static queryObjs = jest.fn();
    static getColumns = jest.fn();
    save = jest.fn();
  }

  return {
    __esModule: true,
    default: MockClinicEntity,
  };
});


describe("ClinicDataService", () => {
  let clinicDataService: ClinicDataService;
  let testClinicArray: ClinicArray;
  let testClinics: Clinic[];

  beforeEach(() => {
    testClinics = [
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
      },
    ];

    const timeStamp = new Date("2025-02-15T12:00:00Z");
    testClinicArray = new ClinicArray(testClinics, timeStamp);

    clinicDataService = new ClinicDataService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("storeClinics", () => {

    it("should store clinics and update the timestamp in AsyncStorage", async () => {
      await expect(clinicDataService.storeClinics(testClinicArray)).resolves.not.toThrow();

      // Check that the timestamp is updated correctly
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        CLINIC_TIMESTAMP_KEY,
        testClinicArray.timeStamp.toISOString()
      );
    });
  });

  describe("getClinics", () => {

    it("should throw EmptyStorageError when no clinic data is available", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      mockGetItem.mockResolvedValueOnce(null);

      // Expect EmptyStorageError to be thrown when no clinic data is available
      await expect(clinicDataService.getClinics()).rejects.toThrow(EmptyStorageError);
    });
});
});
