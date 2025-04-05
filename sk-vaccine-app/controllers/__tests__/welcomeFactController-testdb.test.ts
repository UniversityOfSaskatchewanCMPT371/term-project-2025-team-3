// Mock SQLite module
import { mockdb } from "../../myorm/__tests__/mock-db";
jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn().mockReturnValue({
    execAsync: mockdb.execAsync,
    getAllAsync: mockdb.getAllAsync,
    getFirstAsync: mockdb.getFirstAsync,
    runAsync: mockdb.runAsync,
    execSync: mockdb.execSync,
    getAllSync: mockdb.getAllSync,
  } as unknown as SQLite.SQLiteDatabase),
}));
import * as SQLite from "expo-sqlite";
import { WelcomeFactController } from "@/controllers/welcomeFactController";
import WelcomeFactEntity from "@/myorm/welcomeFact-entity";
import {
  iWelcomeFactController,
  iWelcomeFactService,
} from "@/interfaces/iWelcomeFact";
import { WelcomeFactService } from "@/services/welcomeFactService";
import logger from "@/utils/logger";
import welcomeFacts from "./welcomeFacts.data.txt";

// mock the logger to test its calls
jest.mock("@/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn(),
}));


describe("WelcomeFactController NodeDB Tests", () => {
  let welcomeFactService: iWelcomeFactService = new WelcomeFactService();
  let welcomeFactController: iWelcomeFactController = new WelcomeFactController(
    welcomeFactService
  );

  beforeAll(() => {
    welcomeFactService.getRemoteFactList = jest.fn();
  });

  describe("updateFactList() Tests", () => {
    test("Should put 2 facts into the db", async () => {
      welcomeFactService.getRemoteFactList.mockReturnValue([
        "Most childhood vaccines require multiple doses for full protection.",
        "Vaccines can prevent complications like blindness, brain damage, and death.",
      ]);

      const updates = await welcomeFactController.updateFactList();
      expect(updates).toBe(2);
    });

    test("Should discard commented line, insert 2 facts into the db", async () => {
      welcomeFactService.getRemoteFactList.mockReturnValue([
        "# fact is on a different line",
        "Most childhood vaccines require multiple doses for full protection.",
        "Vaccines can prevent complications like blindness, brain damage, and death.",
      ]);

      const updates = await welcomeFactController.updateFactList();
      expect(updates).toBe(2);
    });

    test("Should pass with 0 facts, only comments given, no db entries", async () => {
      welcomeFactService.getRemoteFactList.mockReturnValue([
        "# fact is on a different line",
        "# Most childhood vaccines require multiple doses for full protection.",
        "# Vaccines can prevent complications like blindness, brain damage, and death.",
      ]);

      const updates = await welcomeFactController.updateFactList();
      expect(updates).toBe(0);
    });

    test("Should pass lines with whitespace prior to starting comment '#', 2 db entries", async () => {
      welcomeFactService.getRemoteFactList.mockReturnValue([
        " # fact is on a different line",
        "Most childhood vaccines require multiple doses for full protection.",
        "Vaccines can prevent complications like blindness, brain damage, and death.",
      ]);

      const updates = await welcomeFactController.updateFactList();
      expect(updates).toBe(2);
    });

    test("Should pass with 0 lines given", async () => {
      welcomeFactService.getRemoteFactList.mockReturnValue([]);

      const updates = await welcomeFactController.updateFactList();
      expect(updates).toBe(0);
      // DB should not be cleared as no facts given
      expect(await WelcomeFactEntity.count()).toBe(2);
      // Cleanup after
      WelcomeFactEntity.clear();
    });
  });

  describe("getFact() Tests", () => {
    test("should return get started message when DB empty and not rerun", async () => {
      WelcomeFactEntity.clear();
      const expected = {
        fact: "To get started, please ensure you have an internet connection!",
        rerun: true,
      };

      const response = await welcomeFactController.getFact(false);
      expect(response).toEqual(expected);
    });

    beforeEach(async () => {
      WelcomeFactEntity.clear();
      for (let line of welcomeFacts.split("\n")) {
        const welcomeFactEntry = new WelcomeFactEntity({
          message: line,
          language: "english",
        });
        await welcomeFactEntry.save();
      }
    });

    test("should return a fact and no rerun", async () => {
      const response = await welcomeFactController.getFact(false);

      // Ensure `fact` is not the specific string
      expect(response.fact).not.toBe(
        "To get started, please ensure you have an internet connection!"
      );

      // Ensure the rest of the response matches the expected structure
      expect(response).toEqual(
        expect.objectContaining({
          rerun: false,
        })
      );
    });

    test("should return default message when DB is empty and is rerun", async () => {
      WelcomeFactEntity.clear();
      const expected = {
        rerun: false,
        fact: "The first vaccine, for smallpox, was developed in 1796.",
      };

      const response = await welcomeFactController.getFact(true);
      expect(response).toEqual(expected);
    });
  });
});
