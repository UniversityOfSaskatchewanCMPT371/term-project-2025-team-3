import ClinicData, { ClinicArray, Clinic } from "@/services/clinicDataService";
import { EmptyStorageError, InvalidArgumentError } from "@/utils/ErrorTypes";
import ClinicEntity from "@/database/clinic-entity";
import { AppDataSource } from "@/database/data-source";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logger from "@/utils/logger";

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


    // set up database
    AppDataSource.initialize()
    .then(() => {
        logger.debug("Database initialized successfully:");
    })
    .catch((err) => {
        logger.error("Database initialization error:", err);
    });



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
      // TODO: Implement test for getClinics success scenario.
    });

    it("should throw EmptyStorageError if no clinic data is stored", async () => {
      // TODO: Implement test for getClinics error when storage is empty.
    });
  });

  describe("searchClinics", () => {
    it("should return matching clinics when valid search parameters are provided", async () => {
      // TODO: Implement test for searchClinics with valid searchValue and column.
    });

    it("should return matching clinics when only searchValue is provided", async () => {
      // TODO: Implement test for searchClinics searching across all text columns.
    });

    it("should throw EmptyStorageError when storage is empty", async () => {
      // TODO: Implement test for searchClinics error scenario when storage is empty.
    });

    it("should throw InvalidArgumentError when an invalid column is provided", async () => {
      // TODO: Implement test for searchClinics with an invalid column.
    });
  });

  describe("getTimeStamp", () => {
    it("should return a valid Date when a timestamp exists", async () => {
      // TODO: Implement test for getTimeStamp success.
    });

    it("should throw EmptyStorageError when no timestamp exists", async () => {
      // TODO: Implement test for getTimeStamp error when timestamp is missing or invalid.
    });
  });

  describe("isValidTextColumn", () => {
    it("should return true for a valid text column name", async () => {
      // TODO: Implement test for isValidTextColumn positive case.
    });

    it("should return false for an invalid text column name", async () => {
      // TODO: Implement test for isValidTextColumn negative case.
    });
  });

  describe("getTextColumns", () => {
    it("should return an array of valid text column names", async () => {
      // TODO: Implement test for getTextColumns.
    });
  });

  describe("isStorageEmpty", () => {
    it("should return true when storage is empty", async () => {
      // TODO: Implement test for isStorageEmpty when no clinics are stored.
    });

    it("should return false when storage contains clinic data", async () => {
      // TODO: Implement test for isStorageEmpty when clinic data is present.
    });
  });

  describe("emptyStorage", () => {
    it("should delete all stored clinic data and timestamp", async () => {
      // TODO: Implement test for emptyStorage.
    });
  });
});
