import { renderHook, waitFor } from '@testing-library/react-native';
import useLocation from '../locationData';
import logger from '@/utils/logger';
import { EmptyStorageError, LocationAccessError } from '@/utils/ErrorTypes';
import ClinicData, { Clinic, ClinicArray } from '@/services/clinicDataService';
import useClinicData, { JSON_TIMESTAMP_KEY } from '../clinicData';
import ClinicEntity from '@/myorm/clinic-entity';
import iClinicData from '@/interfaces/iClinicData';

const unsortedClinics = [
  {
    latitude: 0,
    longitude: -1,
    serviceArea: "Area B",
    name: "Clinic B",
    address: "Address B",
    contactInfo: "555-0003",
    hours: "10 AM - 6 PM",
    services: ["Service"]
  },
  {
    // undefined coordinates clinic should be pushed to end
    latitude: undefined,
    longitude: undefined,
    serviceArea: "Area C",
    name: "Clinic C",
    address: "Address C",
    contactInfo: "555-0004",
    hours: "11 AM - 7 PM",
    services: ["Service"]
  },
  {
    latitude: 0,
    longitude: 0,
    serviceArea: "Area A",
    name: "Clinic A",
    address: "Address A",
    contactInfo: "555-0001",
    hours: "8 AM - 4 PM",
    services: ["Service"]
  },

];

const fakeClinicArray = new ClinicArray(unsortedClinics, new Date());








const testClinics = [
  {
    latitude: 12.345,
    longitude: 67.89,
    serviceArea: "Remote Test 1",
    name: "Remote Clinic 1",
    address: "123 Remote",
    contactInfo: "555-1234",
    hours: "8 AM - 4 PM",
    services: ["Child", "Adult"]
  },
  {
    latitude: 98.76,
    longitude: 54.321,
    serviceArea: "Remote Test 2",
    name: "Remote Clinic 2",
    address: "456 Remote",
    contactInfo: "555-5678",
    hours: "9 AM - 5 PM",
    services: ["Adult"]
  }
];

  
const testJson = {
  clinics: testClinics,
  "time-created": "2025-02-18T08:00:00Z"
};

const remoteClinicArray = new ClinicArray(
  testClinics,
  new Date(testJson["time-created"])
);


const tenthOfFeb = new Date("2025-02-10T08:00:00Z");
const seventeenthOfFeb = new Date("2025-02-17T08:00:00Z");
const nineteenthOfFeb = new Date("2025-02-19T08:00:00Z");


const testClinicArray = new ClinicArray(
  [
    {
      latitude: 11.11,
      longitude: 22.22,
      serviceArea: "Local Test",
      name: "Local Clinic",
      address: "Local St",
      contactInfo: "555-1111",
      hours: "10 AM - 3 PM",
      services: ["Adult"]
    }
  ],
  seventeenthOfFeb
);

const testUrl = "https://test.com";


jest.mock('../../myorm/decorators', () => ({
  Entity: () => (target: any) => target,
  PrimaryGeneratedColumn: () => (target: any) => target,
  Column: () => (target: any) => target
}));
  
const mockClinicData: jest.Mocked<iClinicData> = {
  isStorageEmpty: jest.fn(),
  getTimeStamp: jest.fn(),
  storeClinics: jest.fn(),
  getClinics: jest.fn(),
  searchClinics: jest.fn(),
  isValidTextColumn: jest.fn(),
  getTextColumns: jest.fn(),
  emptyStorage: jest.fn(),
};



const fakeLocationService = {
  isEnabled: jest.fn().mockResolvedValue(true),
  requestPermission: jest.fn().mockResolvedValue(true),
  // return user location [0, 0] for testing
  getLocation: jest.fn().mockResolvedValue([0, 0]),
  // use simple distance function
  compareLocations: jest.fn((userLoc: [number, number], clinicLoc: [number, number]) => {
    const dx = clinicLoc[0] - userLoc[0];
    const dy = clinicLoc[1] - userLoc[1];
    return Math.sqrt(dx * dx + dy * dy);
  }),
};


  
global.fetch = jest.fn();
  
describe("Unit tests for useClinicData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it("sets serverAccessFailed to true if fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Test Error"));
    mockClinicData.isStorageEmpty.mockResolvedValue(false);
    mockClinicData.getTimeStamp.mockResolvedValue(tenthOfFeb);
    mockClinicData.getClinics.mockResolvedValue(testClinicArray);

    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData,
        url: testUrl
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.serverAccessFailed).toBe(true);
    expect(result.current.error).toEqual("Error: Test Error");
    expect(result.current.clinicArray).toEqual(testClinicArray);
  });

  it("sets serverAccessFailed to true if fetch returns not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 404,
        statusText: "Not Found",
        headers: { "Content-Type": "application/json" }
      })
    );
    mockClinicData.isStorageEmpty.mockResolvedValue(false);
    mockClinicData.getTimeStamp.mockResolvedValue(tenthOfFeb);
    mockClinicData.getClinics.mockResolvedValue(testClinicArray);

    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData,
        url: testUrl
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.serverAccessFailed).toBe(true);
    expect(result.current.error).toBe("Not Found");
    expect(result.current.clinicArray).toEqual(testClinicArray);
  });

  it("doesn't fetch remote data if no url is provided", async () => {
    mockClinicData.getClinics.mockResolvedValue(testClinicArray);

    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.clinicArray).toEqual(testClinicArray);
    expect(result.current.error).toBeNull();
    expect(result.current.serverAccessFailed).toBe(false);
  });

  it("searches with searchValue only", async () => {
    mockClinicData.searchClinics.mockResolvedValue(testClinicArray);

    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData,
        searchValue: "TestValue"
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockClinicData.searchClinics).toHaveBeenCalledWith("TestValue");
    expect(result.current.clinicArray).toEqual(testClinicArray);
  });

  it("searches with searchValue and searchColumn", async () => {
    mockClinicData.searchClinics.mockResolvedValue(testClinicArray);

    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData,
        searchValue: "X",
        searchColumn: "name"
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockClinicData.searchClinics).toHaveBeenCalledWith("X", "name");
    expect(result.current.clinicArray).toEqual(testClinicArray);
  });

  it("calls getClinics if no searchValue or searchColumn", async () => {
    mockClinicData.getClinics.mockResolvedValue(testClinicArray);

    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData,
        url: ""
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockClinicData.getClinics).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.clinicArray).toEqual(testClinicArray);
    expect(result.current.error).toBeNull();
  });

  it("handles an error thrown by clinicService", async () => {
    mockClinicData.getClinics.mockRejectedValue(
      new EmptyStorageError("No clinic data available locally")
    );

    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toEqual("EmptyStorageError: No clinic data available locally");
    expect(result.current.clinicArray).toBeNull();
  });

  it("stores remote clinics only if remote is more recent", async () => {
    mockClinicData.isStorageEmpty.mockResolvedValue(false);
    mockClinicData.getTimeStamp.mockResolvedValue(nineteenthOfFeb);
    mockClinicData.getClinics.mockResolvedValue(testClinicArray);

    const updatedRemoteJson = {
      clinics: testClinics,
      "time-created": "2025-02-20T08:00:00Z"
    };

    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify(updatedRemoteJson), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData,
        url: testUrl
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    // because remote timestamp is more recent storeClinics is called
    expect(mockClinicData.storeClinics).toHaveBeenCalledTimes(1);
  });

  it("skips storing remote clinics if local is more recent", async () => {
    mockClinicData.isStorageEmpty.mockResolvedValue(false);
    mockClinicData.getTimeStamp.mockResolvedValue(nineteenthOfFeb);
    mockClinicData.getClinics.mockResolvedValue(testClinicArray);

    const olderRemoteJson = {
      clinics: testClinics,
      "time-created": "2025-02-18T08:00:00Z"
    };

    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify(olderRemoteJson), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData,
        url: testUrl
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    // because local is more recent storeClinics is not called
    expect(mockClinicData.storeClinics).not.toHaveBeenCalled();
  });
  
  it("sorts clinics by distance when location is available", async () => {
    mockClinicData.isStorageEmpty.mockResolvedValue(false);
    mockClinicData.getClinics.mockResolvedValue(fakeClinicArray);
    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData,
        sortByDistance: true,
        locationService: fakeLocationService,
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    const sortedClinics = result.current.clinicArray?.clinics;
    expect(sortedClinics).toBeDefined();

    // expect A at [0,0] to be first
    expect(sortedClinics![0].name).toBe("Clinic A");
    // expect B at [0,-1] to be second
    expect(sortedClinics![1].name).toBe("Clinic B");
    // expect C with undefined coordinates should be last
    expect(sortedClinics![2].name).toBe("Clinic C");
  });

  it("does not sort clinics by distance if location services are not enabled", async () => {
    mockClinicData.isStorageEmpty.mockResolvedValue(false);
    mockClinicData.getClinics.mockResolvedValue(fakeClinicArray);
    // create fake location service that fails location access
    const failingLocationService = {
      isEnabled: jest.fn().mockResolvedValue(false),
      requestPermission: jest.fn().mockResolvedValue(false),
      getLocation: jest.fn(),
      compareLocations: jest.fn(),
    };


    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData,
        sortByDistance: true,
        locationService: failingLocationService,
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // the clinics should be in the original order
    const clinicNames = result.current.clinicArray?.clinics.map(clinic => clinic.name);
    const unsortedClinicNames = unsortedClinics.map(clinic => clinic.name);
    
    expect(clinicNames).toEqual(unsortedClinicNames);
  });
  



});