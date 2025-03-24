jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn().mockReturnValue({
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
    execSync: jest.fn(),
    getAllSync: jest.fn(),
  } as unknown as SQLite.SQLiteDatabase),
}));
import ClinicData, { ClinicArray, Clinic, CLINIC_TIMESTAMP_KEY } from "@/services/clinicDataService";
import { EmptyStorageError, InvalidArgumentError } from "@/utils/ErrorTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logger from "@/utils/logger";
import BaseEntity from "@/myorm/base-entity";
import * as SQLite from 'expo-sqlite';
import ClinicEntity from "@/myorm/clinic-entity";
import { ColumnMetadata } from "@/myorm/decorators";






// mock ClinicEntity
jest.mock("@/myorm/clinic-entity", () => {

  const actualModule = jest.requireActual("@/myorm/base-entity");
  
  class MockClinicEntity extends actualModule.default{
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
    default: MockClinicEntity,
  };
});



describe("Unit tests for ClinicData", () => {


  let clinicData: ClinicData;
  let testClinicArray: ClinicArray
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
      }
      
    ];
    const timeStamp = new Date("2025-02-15T12:00:00Z");
    testClinicArray = new ClinicArray(testClinics, timeStamp);
    clinicData = new ClinicData();




  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("storeClinics", () => {
    it("should store clinics without errors", async () => {

      // does not throw error
      await expect(clinicData.storeClinics(testClinicArray)).resolves.not.toThrow();
      
      // saves the timestamp
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        CLINIC_TIMESTAMP_KEY,
        testClinicArray.timeStamp.toISOString()
      );
    });
  });

  describe("getClinics", () => {
    it("should return a ClinicArray when data is available", async () => {

      clinicData.isStorageEmpty = jest.fn(async () => false);


      // store a set of clinics in the db
      (ClinicEntity.find as jest.Mock).mockResolvedValue(
        testClinicArray.clinics
      );

      

      // get timestamp
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        testClinicArray.timeStamp.toISOString()
      );
      





      expect(await clinicData.getClinics()).toEqual( new ClinicArray(testClinics, testClinicArray.timeStamp));
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        CLINIC_TIMESTAMP_KEY
      );

      

    });

    it("should throw EmptyStorageError if no clinic data is stored", async () => {
      clinicData.isStorageEmpty = jest.fn(async () => true);


      // store a set of clinics in the db
      (ClinicEntity.find as jest.Mock).mockResolvedValue(
        testClinicArray.clinics
      );

      

      // get timestamp
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        testClinicArray.timeStamp.toISOString()
      );



      await expect(clinicData.getClinics()).rejects.toThrow(EmptyStorageError);


    });
  });

  describe("searchClinics", () => {
    it("should return matching clinics when valid search parameters are provided", async () => {
      jest.spyOn(clinicData, "isStorageEmpty").mockResolvedValue(false);
      jest.spyOn(clinicData, "isValidTextColumn").mockResolvedValue(true);
      jest.spyOn(clinicData, "getTimeStamp").mockResolvedValue(
        testClinicArray.timeStamp
      );
  
      (ClinicEntity.queryObjs as jest.Mock).mockResolvedValue(testClinics);
  
      const result = await clinicData.searchClinics("Clinic", "name");
  
      expect(clinicData.isStorageEmpty).toHaveBeenCalled();
      expect(clinicData.isValidTextColumn).toHaveBeenCalledWith("name");
      expect(ClinicEntity.queryObjs).toHaveBeenCalledWith(
        "SELECT * from $table WHERE name LIKE ?",
        "%Clinic%"
      );
      expect(result.clinics).toEqual(testClinics);
      expect(result.timeStamp).toEqual(testClinicArray.timeStamp);
    });
  
    it("should return matching clinics when only searchValue is provided", async () => {
      jest.spyOn(clinicData, "isStorageEmpty").mockResolvedValue(false);
      jest.spyOn(clinicData, "getTextColumns").mockResolvedValue(["name", "address"]);
      jest.spyOn(clinicData, "getTimeStamp").mockResolvedValue(
        testClinicArray.timeStamp
      );
  
      (ClinicEntity.queryObjs as jest.Mock).mockResolvedValue(testClinics);
  
      const result = await clinicData.searchClinics("TestValue");
  
      expect(clinicData.isStorageEmpty).toHaveBeenCalled();
      expect(clinicData.getTextColumns).toHaveBeenCalled();
      expect(ClinicEntity.queryObjs).toHaveBeenCalledWith(
        "SELECT * from $table WHERE name LIKE ? OR address LIKE ?",
        "%TestValue%",
        "%TestValue%"
      );
      expect(result.clinics).toEqual(testClinics);
      expect(result.timeStamp).toEqual(testClinicArray.timeStamp);
    });
  
    it("should throw EmptyStorageError when storage is empty", async () => {
      jest.spyOn(clinicData, "isStorageEmpty").mockResolvedValue(true);
  
      await expect(clinicData.searchClinics("AnyValue")).rejects.toThrow(
        EmptyStorageError
      );
      expect(clinicData.isStorageEmpty).toHaveBeenCalled();
      expect(ClinicEntity.queryObjs).not.toHaveBeenCalled();
    });
  
    it("should throw InvalidArgumentError when an invalid column is provided", async () => {
      jest.spyOn(clinicData, "isStorageEmpty").mockResolvedValue(false);
      jest.spyOn(clinicData, "isValidTextColumn").mockResolvedValue(false);
      jest.spyOn(clinicData, "getTextColumns").mockResolvedValue(["name", "address"]);
  
      await expect(clinicData.searchClinics("SomeValue", "invalidColumn")).rejects.toThrow(
        InvalidArgumentError
      );
      expect(clinicData.isStorageEmpty).toHaveBeenCalled();
      expect(clinicData.isValidTextColumn).toHaveBeenCalledWith("invalidColumn");
      expect(ClinicEntity.queryObjs).not.toHaveBeenCalled();
    });
  });

  describe("getTimeStamp", () => {
    it("should return a valid Date when a timestamp exists", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(testClinicArray.timeStamp);
  
      const result = await clinicData.getTimeStamp();
  
      expect(result.toISOString()).toBe(testClinicArray.timeStamp.toISOString());
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(CLINIC_TIMESTAMP_KEY);
    });
  
    it("should throw EmptyStorageError when no timestamp exists", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  
      await expect(clinicData.getTimeStamp()).rejects.toThrow(EmptyStorageError);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(CLINIC_TIMESTAMP_KEY);
    });
  });

  it("should return true for a valid text column name", async () => {
    jest.spyOn(clinicData, "getTextColumns").mockResolvedValue([
      "col",
    ]);

    const result = await clinicData.isValidTextColumn("col");

    expect(clinicData.getTextColumns).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it("should return false for an invalid text column name", async () => {
    jest.spyOn(clinicData, "getTextColumns").mockResolvedValue([
      "col"
    ]);

    const result = await clinicData.isValidTextColumn("notAColumn");

    expect(clinicData.getTextColumns).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });

  describe("getTextColumns", () => {
    it("should return an array of valid text column names", async () => {
      (ClinicEntity.getColumns as jest.Mock).mockResolvedValue(
        [
          {type: "TEXT", name: "colOne"},
          {type: "INTEGER", name: "colTwo"},
          {type: "REAL", name: "colThree"},
          {type: "VARCHAR", name: "colFour"},
          {type: "CHARACTER", name: "colFive"},
        ] as Array<ColumnMetadata>
      )

      expect(await clinicData.getTextColumns()).toEqual(
        [
          "colOne",
          "colFour",
          "colFive",
        ]
      );


    
    
    });
  });

  describe("isStorageEmpty", () => {
    it("should return true when storage is empty", async () => {
      (ClinicEntity.count as jest.Mock).mockResolvedValue(0);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(testClinicArray.timeStamp);
      const result = await clinicData.isStorageEmpty();
  
      expect(result).toBe(true);
      expect(ClinicEntity.count).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(CLINIC_TIMESTAMP_KEY);
    });

    it("should return true when timestamp is empty", async () => {
      (ClinicEntity.count as jest.Mock).mockResolvedValue(2);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('');
      const result = await clinicData.isStorageEmpty();
  
      expect(result).toBe(true);
      expect(ClinicEntity.count).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(CLINIC_TIMESTAMP_KEY);
    });
  
    it("should return false when storage contains clinic data", async () => {
      (ClinicEntity.count as jest.Mock).mockResolvedValue(5);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(testClinicArray.timeStamp);
      const result = await clinicData.isStorageEmpty();
  
      expect(result).toBe(false);
      expect(ClinicEntity.count).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(CLINIC_TIMESTAMP_KEY);
    });
  });

  describe("emptyStorage", () => {
    it("should delete all stored clinic data and timestamp", async () => {
  
      await clinicData.emptyStorage();
  
      expect(ClinicEntity.clear).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(CLINIC_TIMESTAMP_KEY);
    });
  });
});
