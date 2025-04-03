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
import * as SQLite from "expo-sqlite";
import { WelcomeFactController } from "@/controllers/welcomeFactController";
import { iWelcomeFactController } from "@/interfaces/iWelcomeFact";
import { WelcomeFactService } from "@/services/welcomeFactService";
import logger from "@/utils/logger";

// Mocking the logger
jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Mock the VaccineDataService class
jest.mock("../../services/welcomeFactService");

describe("VaccineDataController MockDB Tests", () => {
  let welcomeFactController: iWelcomeFactController;
  let mockWelcomeFactService: jest.Mocked<WelcomeFactService>;

  beforeEach(() => {
    // Create a mocked instance of VaccineDataService
    mockWelcomeFactService =
      new WelcomeFactService() as jest.Mocked<WelcomeFactService>;

    // Explicitly mock methods of the service we expect to use
    mockWelcomeFactService.getRemoteFactList = jest.fn();
    mockWelcomeFactService.saveFactList = jest.fn();
    mockWelcomeFactService.getRandomFact = jest.fn();

    // Inject the mocked VaccineDataService into the controller
    welcomeFactController = new WelcomeFactController(mockWelcomeFactService);

    // Spy on the service methods used within the controller methods
    jest.spyOn(mockWelcomeFactService, "getRemoteFactList");
    jest.spyOn(mockWelcomeFactService, "saveFactList");
    jest.spyOn(mockWelcomeFactService, "getRandomFact");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("updateFactList() Tests", () => {
    test("Should update 2 facts", async () => {
      mockWelcomeFactService.getRemoteFactList.mockReturnValue([
        "Most childhood vaccines require multiple doses for full protection.",
        "Vaccines can prevent complications like blindness, brain damage, and death.",
      ]);
      mockWelcomeFactService.saveFactList.mockResolvedValue(2);

      const updates = await welcomeFactController.updateFactList();
      expect(updates).toBe(2);
    });

    test("Should remove the comment lines, given 3 lines", async () => {
      mockWelcomeFactService.getRemoteFactList.mockReturnValue([
        "# fact is on a different line",
        "Most childhood vaccines require multiple doses for full protection.",
        "Vaccines can prevent complications like blindness, brain damage, and death.",
      ]);

      mockWelcomeFactService.saveFactList.mockResolvedValue(2);

      const updates = await welcomeFactController.updateFactList();
      expect(updates).toBe(2);
    });

    test("Should pass with 0 facts, only comments given", async () => {
      mockWelcomeFactService.getRemoteFactList.mockReturnValue([
        "# fact is on a different line",
        "# Most childhood vaccines require multiple doses for full protection.",
        "# Vaccines can prevent complications like blindness, brain damage, and death.",
      ]);

      mockWelcomeFactService.saveFactList.mockResolvedValue(0);

      const updates = await welcomeFactController.updateFactList();
      expect(updates).toBe(0);
    });

    test("Should pass lines with whitespace prior to starting comment '#'", async () => {
      mockWelcomeFactService.getRemoteFactList.mockReturnValue([
        " # fact is on a different line",
        "Most childhood vaccines require multiple doses for full protection.",
        "Vaccines can prevent complications like blindness, brain damage, and death.",
      ]);

      mockWelcomeFactService.saveFactList.mockResolvedValue(2);

      const updates = await welcomeFactController.updateFactList();
      expect(updates).toBe(2);
    });

    test("Should pass with 0 lines given", async () => {
      mockWelcomeFactService.getRemoteFactList.mockReturnValue([]);

      mockWelcomeFactService.saveFactList.mockResolvedValue(0);

      const updates = await welcomeFactController.updateFactList();
      expect(updates).toBe(0);
    });
  });

  describe("getFact() Tests", () => {
    test("should return a fact and no rerun", async () => {
      const expected = {
        fact: "Most childhood vaccines require multiple doses for full protection.",
        rerun: false,
      };

      mockWelcomeFactService.getRandomFact.mockReturnValue({
        message:
          "Most childhood vaccines require multiple doses for full protection.",
        language: "english",
      });
      const response = await welcomeFactController.getFact();
      expect(response).toEqual(expected);
    });

    test("should return default 'get started' message and rerun", async () => {
      const expected = {
        fact: "To get started, please ensure you have an internet connection!",
        rerun: true,
      };

      mockWelcomeFactService.getRandomFact.mockReturnValue({
        message: undefined,
        language: "english",
      });
      const response = await welcomeFactController.getFact();
      expect(response).toEqual(expected);
    });

    test("should return default message when error", async () => {
      const expected = {
        fact: "To get started, please ensure you have an internet connection!",
        rerun: true,
      };

      // Make the mocked function throw an error when called
      mockWelcomeFactService.getRandomFact.mockImplementation(() => {
        throw new Error();
      });
      const response = await welcomeFactController.getFact();
      expect(response).toEqual(expected);
    });

    test("should return default message when error", async () => {
      const expected = {
        fact: "To get started, please ensure you have an internet connection!",
        rerun: true,
      };

      // Make the mocked function throw an error when called
      mockWelcomeFactService.getRandomFact.mockImplementation(() => {
        throw new Error();
      });
      const response = await welcomeFactController.getFact();
      expect(response).toEqual(expected);
    });
  });
});
