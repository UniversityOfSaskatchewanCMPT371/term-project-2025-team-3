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

import { WelcomeFactService } from "@/services/welcomeFactService";
import WelcomeFactEntity from "@/myorm/welcomeFact-entity";
import * as SQLite from "expo-sqlite";
import nocommentsFacts from "./welcomeFacts-nc.data.txt";
import welcomeFacts from "./welcomeFacts.data.txt";
import logger from "../../utils/logger";
import { FactQueryError } from "../../utils/ErrorTypes";
import jestTransformer from "../../jest/jest-transformer";

// mock the logger to test its calls
jest.mock("@/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn(),
}));

describe("WelcomeFactService NodeDB Tests", () => {
  let welcomeFactService: WelcomeFactService = new WelcomeFactService();

  beforeAll(async () => {
    for (let fact in welcomeFacts.split("\n")) {
      const welcomeFactEntry = new WelcomeFactEntity({
        message: fact,
        language: "english",
      });
      await welcomeFactEntry.save();
    }
  });

  describe("getRemoteFactList() Tests", () => {
    test("Testing the data is retrieved from actual remote", async () => {
      const response = await welcomeFactService.getRemoteFactList();
      const expected = welcomeFacts.split("\n");

      expect(response).toEqual(expected);
    });
  });

  describe("saveFactList() Tests", () => {
    test("should try to clear the database", async () => {
      const facts = nocommentsFacts.split("\n").map((fact: string) => {
        return { message: fact, language: "english" };
      });

      const saveSpy = jest.spyOn(WelcomeFactEntity.prototype, "save");

      const response = await welcomeFactService.saveFactList(facts);

      expect(saveSpy).toHaveBeenCalledTimes(facts.length);
    });

    test("should not clear the DB as the input is empty", async () => {
      const clearSpy = jest.spyOn(WelcomeFactEntity, "clear");

      const warningSpy = jest
        .spyOn(logger, "warning")
        .mockImplementation(() => {});

      const response = await welcomeFactService.saveFactList([]);

      expect(warningSpy).toHaveBeenCalledWith(
        "The list of WelcomeFacts is empty"
      );
      expect(clearSpy).not.toHaveBeenCalled();
      expect(await WelcomeFactEntity.count()).toBe(14);

      warningSpy.mockRestore(); // optional cleanup
    });
  });

  describe("getRandomFact() Tests", () => {
    test("should return a random fact", async () => {
      const response = await welcomeFactService.getRandomFact();

      // Ensure the rest of the response matches the expected structure
      expect(response).toEqual(
        expect.objectContaining({
          language: "english",
        })
      );
    });

    test("should log that there are 0 facts", async () => {
      await WelcomeFactEntity.clear();
      const warningSpy = jest
        .spyOn(logger, "warning")
        .mockImplementation(() => {});

      await welcomeFactService.getRandomFact();

      await expect(await welcomeFactService.getRandomFact()).toBe(undefined)

      expect(warningSpy).toHaveBeenCalledWith(
        "There are no welcome facts in the DB"
      );
    });
  });
});
