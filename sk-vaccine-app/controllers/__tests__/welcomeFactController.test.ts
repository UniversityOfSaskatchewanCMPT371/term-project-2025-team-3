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
import * as SQLite from 'expo-sqlite';
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
    test("Should say 2 facts are updated", async () => {
      mockWelcomeFactService.getRemoteFactList.mockReturnValue(
        ["Most childhood vaccines require multiple doses for full protection.", "Vaccines can prevent complications like blindness, brain damage, and death."]
      );
      mockWelcomeFactService.saveFactList.mockResolvedValue(2);

      const updates = await welcomeFactController.updateFactList()
      expect(updates).toBe(2);

    });
  });

  describe("getFact() Tests", () => {});
});
