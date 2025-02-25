import { renderHook, waitFor } from '@testing-library/react-native';
import useLocation from '../locationData';
import logger from '@/utils/logger';
import { EmptyStorageError, LocationAccessError } from '@/utils/ErrorTypes';
import ClinicData, { Clinic, ClinicArray } from '@/services/clinicDataService';
import useClinicData, { JSON_TIMESTAMP_KEY } from '../clinicData';
import ClinicEntity from '@/myorm/clinic-entity';
import iClinicData from '@/interfaces/iClinicData';

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
  
global.fetch = jest.fn();
  
describe("Unit tests for useClinicData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it("returns remote data if available", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify(testJson), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
    mockClinicData.isStorageEmpty.mockResolvedValue(true);
    mockClinicData.getClinics.mockResolvedValue(testClinicArray);

    const { result } = renderHook(() =>
      useClinicData({
        clinicService: mockClinicData,
        url: testUrl
      })
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.clinicArray).toEqual(testClinicArray);
    expect(result.current.error).toBeNull();
    expect(result.current.serverAccessFailed).toBe(false);
    expect(mockClinicData.storeClinics).toHaveBeenCalled();
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
});