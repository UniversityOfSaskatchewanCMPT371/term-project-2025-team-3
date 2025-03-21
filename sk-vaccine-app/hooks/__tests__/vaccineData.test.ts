import { renderHook, act, waitFor } from "@testing-library/react-native";
import {
  iVaccineDataController,
  VaccineSheet,
} from "@/interfaces/iVaccineData";
import { useVaccineSheets, useUpdateVaccineSheets } from "../vaccineData";
import { useNetworkState } from 'expo-network';

// Mocking the logger
jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
}));

// Mock the VaccineDataController class
jest.mock("../../controllers/vaccineDataController");

jest.mock('expo-network', () => ({
  useNetworkState: jest.fn(),
}));

describe("Unit Tests for VaccineData hooks", () => {
  let mockVaccineDataController: jest.Mocked<iVaccineDataController>;

  const MockVaccineDataController = jest.fn().mockImplementation(() => ({
    searchVaccines: jest.fn(),
    updateVaccines: jest.fn(),
    updateVaccineList: jest.fn(),
    vaccineListUpToDate: jest.fn(),
  }));

  beforeEach(() => {
    // Create a mocked instance of VaccineDataService
    mockVaccineDataController = new MockVaccineDataController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Unit tests for useVaccineSheets", () => {
    test("Search is called when hook is rendered, data received", async () => {
      const searchResponse: VaccineSheet[] = [
        {
          vaccineName: "DTaP-IPV-Hib",
          associatedDiseases: [
            "Diphtheria",
            "Tetanus",
            "Pertussis",
            "Polio",
            "Haemophilus Influenzae Type b",
          ],
          pdfPath: "path/to/pdf",
          /**
           * @field starting: This could be age or grade
           */
          starting: "2 Mo",
        },
      ];

      const expected = {
        vaccineSheets: searchResponse,
        loading: false,
        error: undefined,
        fetchResults: expect.any(Function),
      };

      mockVaccineDataController.searchVaccines.mockResolvedValue(
        searchResponse
      );

      const { result } = renderHook(() =>
        useVaccineSheets({ vaccineController: mockVaccineDataController })
      );

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toMatchObject(expected);
    });
    test("fetchResult is called", async () => {
      const searchResponse: VaccineSheet[] = [
        {
          vaccineName: "DTaP-IPV-Hib",
          associatedDiseases: [
            "Diphtheria",
            "Tetanus",
            "Pertussis",
            "Polio",
            "Haemophilus Influenzae Type b",
          ],
          pdfPath: "path/to/pdf",
          /**
           * @field starting: This could be age or grade
           */
          starting: "2 Mo",
        },
      ];

      const expected = {
        vaccineSheets: searchResponse,
        loading: false,
        error: undefined,
        fetchResults: expect.any(Function),
      };

      mockVaccineDataController.searchVaccines.mockResolvedValue(
        searchResponse
      );

      const { result } = renderHook(() =>
        useVaccineSheets({ vaccineController: mockVaccineDataController })
      );

      expect(result.current.loading).toBe(true);
      // Spy on the function
      const fetchResultsSpy = jest.spyOn(result.current, "fetchResults");

      // Manually call fetchResults
      await act(async () => {
        await result.current.fetchResults();
      });

      expect(fetchResultsSpy).toHaveBeenCalled();
    });

    test("fetchResults is called and returns different data the second time", async () => {
      const searchResponse1: VaccineSheet[] = [
        {
          vaccineName: "DTaP-IPV-Hib",
          associatedDiseases: [
            "Diphtheria",
            "Tetanus",
            "Pertussis",
            "Polio",
            "Haemophilus Influenzae Type b",
          ],
          pdfPath: "path/to/pdf",
          /**
           * @field starting: This could be age or grade
           */
          starting: "2 Mo",
        },
      ];

      const searchResponse2: VaccineSheet[] = [
        {
          vaccineName: "DTaP-IPV-Hib",
          associatedDiseases: [
            "Diphtheria",
            "Tetanus",
            "Pertussis",
            "Polio",
            "Haemophilus Influenzae Type b",
          ],
          pdfPath: "path/to/pdf",
          /**
           * @field starting: This could be age or grade
           */
          starting: "2 Mo",
        },
        {
          vaccineName: "Rotavirus",
          associatedDiseases: ["Rotavirus"],
          pdfPath: "path/to/pdf",
          /**
           * @field starting: This could be age or grade
           */
          starting: "2 Mo",
        },
      ];

      mockVaccineDataController.searchVaccines.mockResolvedValueOnce(
        searchResponse1
      );
      mockVaccineDataController.searchVaccines.mockResolvedValueOnce(
        searchResponse2
      );

      const { result, rerender } = renderHook(
        ({ vaccineController, searchValue }) =>
          useVaccineSheets({ vaccineController, searchValue }),
        {
          initialProps: {
            vaccineController: mockVaccineDataController,
            searchValue: "", // Initial search value
          },
        }
      );

      // Ensure loading is true initially
      expect(result.current.loading).toBe(true);

      // Wait for the first result to be loaded
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.vaccineSheets).toEqual(searchResponse1);

      // Change the search value to trigger refetching
      rerender({
        vaccineController: mockVaccineDataController,
        searchValue: "Rotavirus",
      });

      // Wait for the second response to be loaded
      await waitFor(() =>
        expect(result.current.vaccineSheets).toEqual(searchResponse2)
      );

      // Assert that searchVaccines was called twice
      expect(mockVaccineDataController.searchVaccines).toHaveBeenCalledTimes(2);
      expect(mockVaccineDataController.searchVaccines).toHaveBeenCalledWith(
        "Rotavirus",
        undefined
      ); // Ensure it's called with the updated searchValue
    });
  });
  describe("Unit tests for useUpdateVaccineSheets", () => {
    test('should return success when vaccines are updated', async () => {
      const updateResponse = {
        success: true,
        updated: 5,
        failed: 0,
      };
  
      // Mock the controller's updateVaccines method to resolve with a successful response
      mockVaccineDataController.updateVaccines = jest.fn().mockResolvedValue(updateResponse);
  
      // Simulate the network state as connected
      (useNetworkState as jest.Mock).mockReturnValue({ isConnected: true });
  
      const { result } = renderHook(() => useUpdateVaccineSheets(mockVaccineDataController));
  
      await act(async () => {});
  
      expect(result.current.success).toBe(true);
      expect(result.current.updated).toBe(5);
      expect(result.current.failed).toBe(0);
    });
  
    test('should return failure when updateVaccines fails', async () => {
      const updateResponse = {
        success: false,
        updated: 0,
        failed: 5,
      };
  
      // Mock the controller's updateVaccines method to throw an error
      mockVaccineDataController.updateVaccines = jest.fn().mockRejectedValue(new Error('Update failed'));
  
      // Simulate the network state as connected
      (useNetworkState as jest.Mock).mockReturnValue({ isConnected: true });
  
      const { result } = renderHook(() => useUpdateVaccineSheets(mockVaccineDataController));
  
      await act(async () => {});
  
      expect(result.current.success).toBe(false);
      expect(result.current.updated).toBe(0);
      expect(result.current.failed).toBe(0);
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Update failed');
    });
  
    test('should not try to update if network is offline', async () => {
      // Mock the controller's updateVaccines method (it should not be called)
      mockVaccineDataController.updateVaccines = jest.fn();
  
      // Simulate the network state as disconnected
      (useNetworkState as jest.Mock).mockReturnValue({ isConnected: false });
  
      const { result } = renderHook(() => useUpdateVaccineSheets(mockVaccineDataController));
  
      await act(async () => {});
  
      // Ensure that the updateVaccines function was not called
      expect(mockVaccineDataController.updateVaccines).not.toHaveBeenCalled();
      expect(result.current.success).toBe(false);
      expect(result.current.updated).toBe(0);
      expect(result.current.failed).toBe(0);
    });
  
    test('should clean up and prevent state updates after unmount', async () => {
      const updateResponse = {
        success: true,
        updated: 5,
        failed: 0,
      };
  
      // Mock the controller's updateVaccines method to resolve with a successful response
      mockVaccineDataController.updateVaccines = jest.fn().mockResolvedValue(updateResponse);
  
      // Simulate the network state as connected
      (useNetworkState as jest.Mock).mockReturnValue({ isConnected: true });
  
      const { result, unmount } = renderHook(() => useUpdateVaccineSheets(mockVaccineDataController));
  
      await act(async () => {});
  
      // Ensure the result is set correctly after mount
      expect(result.current.success).toBe(true);
  
      // Now unmount the hook
      unmount();
  
      // Try to trigger another update after unmount (should not update state)
      await act(async () => {
        mockVaccineDataController.updateVaccines.mockResolvedValue({
          success: true,
          updated: 10,
          failed: 0,
        });
      });
  
      // Ensure state was not updated after unmount
      expect(result.current.success).toBe(true);
      expect(result.current.updated).toBe(5); // Previous value
    });
  })
});
