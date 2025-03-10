import { renderHook, act, waitFor } from "@testing-library/react-native";
import {
  iVaccineDataController,
  VaccineSheet,
} from "@/interfaces/iVaccineData";
import { useVaccineSheets } from "../vaccineData";

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
});
