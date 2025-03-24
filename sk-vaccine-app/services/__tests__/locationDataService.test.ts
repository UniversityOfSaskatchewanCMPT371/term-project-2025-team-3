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
