import { renderHook, waitFor } from "@testing-library/react-native";
import LocationData from "@/services/locationDataService";
import {
  getLastKnownPositionAsync,
  hasServicesEnabledAsync,
  requestForegroundPermissionsAsync,
} from "expo-location";

import { PermissionStatus } from "expo-location";
import { LocationAccessError } from "@/utils/ErrorTypes";

jest.mock("expo-location", () => ({
  __esModule: true,
  hasServicesEnabledAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Unit tests for LocationData.isEnabled", () => {
  it("test isEnabled true", async () => {
    (hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);

    const result = await new LocationData().isEnabled();

    expect(result).toBe(true);
    expect(hasServicesEnabledAsync).toHaveBeenCalled();
  });

  it("test isEnabled false", async () => {
    (hasServicesEnabledAsync as jest.Mock).mockResolvedValue(false);

    const result = await new LocationData().isEnabled();

    expect(result).toBe(false);
    expect(hasServicesEnabledAsync).toHaveBeenCalled();
  });
});

describe("Unit tests for LocationData.getLocation", () => {
  it("last known location is NOT null", async () => {
    const fakeLocation = {
      coords: {
        latitude: 37,
        longitude: -122,
        altitude: null,
        accuracy: 5,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
      mocked: true,
    };

    (getLastKnownPositionAsync as jest.Mock).mockResolvedValue(fakeLocation);

    const result = await new LocationData().getLocation();

    expect(result).toEqual([37, -122]);
    expect(getLastKnownPositionAsync).toHaveBeenCalled();
  });

  it("last known location is null", async () => {
    (getLastKnownPositionAsync as jest.Mock).mockResolvedValue(null);

    expect(async () => {
      await new LocationData().getLocation();
    }).rejects.toThrow(LocationAccessError);

    expect(getLastKnownPositionAsync).toHaveBeenCalled();
  });
});

describe("Unit tests for LocationData.requestPermission", () => {
  it("permission is granted", async () => {
    const fakeLocationPermission = {
      canAskAgain: true,
      expires: "never",
      granted: true,
    };

    (requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(
      fakeLocationPermission
    );

    const result = await new LocationData().requestPermission();

    expect(result).toBe(true);

    expect(requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it("permission is denied", async () => {
    const fakeLocationPermission = {
      canAskAgain: false,
      expires: "never",
      granted: false,
    };

    (requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(
      fakeLocationPermission
    );

    const result = await new LocationData().requestPermission();

    expect(result).toBe(false);

    expect(requestForegroundPermissionsAsync).toHaveBeenCalled();
  });
});


describe("Unit tests for LocationData.compareLocations", () => {
  let locationData: LocationData;
  beforeEach(() => {
    locationData = new LocationData();
  });

  it("should return 0 for identical coords", () => {
    const dist = locationData.compareLocations([0, 0], [0, 0]);
    expect(dist).toBe(0);
  });

  it("calculates distance correctly", () => {
    // [0, 0] and [0, 180] are about 20015 km apart.
    const dist = locationData.compareLocations([0, 0], [0, 180]);
    expect(dist).toBeGreaterThan(20014);
    expect(dist).toBeLessThan(20016);
  });

  it("should throw an error for an out of range latitude", () => {
    // latitude must be between -90 and 90
    expect(() => {
      locationData.compareLocations([100, 0], [0, 0]);
    }).toThrow();
  });

  it("should throw an error for an out of range longitude", () => {
    // Longitude must be between -180 and 180
    expect(() => {
      locationData.compareLocations([0, 200], [0, 0]);
    }).toThrow();
  });
});
