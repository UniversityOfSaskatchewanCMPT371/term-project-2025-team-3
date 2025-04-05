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
import { WelcomeFactService } from "@/services/welcomeFactService";
import WelcomeFactEntity from "@/myorm/welcomeFact-entity";
import welcomeFacts from "./welcomeFacts.data.txt";
import { FactQueryError, RemoteFactError } from "../../utils/ErrorTypes";
import logger from "@/utils/logger";
import jestTransformer from "../../jest/jest-transformer";

// mock the logger to test its calls
jest.mock("@/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn(),
}));

describe("WelcomeFactService MockDB Tests", () => {
  let welcomeFactService: WelcomeFactService;

  beforeEach(() => {
    welcomeFactService = new WelcomeFactService();
  });

  describe("getRemoteFactList() Tests", () => {
    test("should be called with the github URL", async () => {
      jest.spyOn(global, "fetch").mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(welcomeFacts),
      } as Response);

      const response = await welcomeFactService.getRemoteFactList();
      expect(fetch).toHaveBeenCalledWith(
        "https://raw.githubusercontent.com/ThompsonC-collab/immsapp-data/refs/heads/main/welcomeFacts.txt"
      );
      expect(fetch).toHaveBeenCalledTimes(1);

      jest.restoreAllMocks(); // Restore fetch after the test
    });

    test("should throw RemoteFactError if fetch fails", async () => {
      jest.spyOn(global, "fetch").mockResolvedValueOnce(new Error());

      await expect(welcomeFactService.getRemoteFactList()).rejects.toThrow(
        RemoteFactError
      );

      expect(fetch).toHaveBeenCalledWith(
        "https://raw.githubusercontent.com/ThompsonC-collab/immsapp-data/refs/heads/main/welcomeFacts.txt"
      );
      expect(fetch).toHaveBeenCalledTimes(1);

      jest.restoreAllMocks(); // Restore fetch after the test
    });

    test("should throw RemoteFactError with custom message if fetch content is not of type 'txt'", async () => {
      jest.spyOn(global, "fetch").mockResolvedValueOnce(new TypeError());

      await expect(welcomeFactService.getRemoteFactList()).rejects.toThrow(
        new RegExp("Response not of type 'txt', Error: .*")
      );
      expect(fetch).toHaveBeenCalledWith(
        "https://raw.githubusercontent.com/ThompsonC-collab/immsapp-data/refs/heads/main/welcomeFacts.txt"
      );
      expect(fetch).toHaveBeenCalledTimes(1);

      jest.restoreAllMocks(); // Restore fetch after the test
    });

    test("should not fail when response is empty", async () => {
      jest.spyOn(global, "fetch").mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(""),
      } as Response);

      const response = await welcomeFactService.getRemoteFactList();
      expect(fetch).toHaveBeenCalledWith(
        "https://raw.githubusercontent.com/ThompsonC-collab/immsapp-data/refs/heads/main/welcomeFacts.txt"
      );
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(response).toEqual([""]);

      jest.restoreAllMocks(); // Restore fetch after the test
    });
  });

  describe("saveFactList() Tests", () => {
    test("should try to clear the database", async () => {
      const clearSpy = jest
        .spyOn(WelcomeFactEntity, "clear")
        .mockImplementation(() => {});

      const saveSpy = jest
        .spyOn(WelcomeFactEntity.prototype, "save")
        .mockImplementation(() => {});

      await welcomeFactService.saveFactList([
        { message: "some fact", language: "english" },
      ]);

      expect(clearSpy).toHaveBeenCalled();

      clearSpy.mockRestore();
      saveSpy.mockRestore();
    });

    test("should try to save to the database 4 times", async () => {
      const clearSpy = jest
        .spyOn(WelcomeFactEntity, "clear")
        .mockImplementation(() => {});

      const saveSpy = jest
        .spyOn(WelcomeFactEntity.prototype, "save")
        .mockImplementation(() => Promise.resolve()); // returns a resolved Promise

      // Call your actual function that should trigger `clear`
      await welcomeFactService.saveFactList([
        { message: "some fact", language: "english" },
        { message: "some fact 2", language: "english" },
        { message: "some fact 3", language: "english" },
        { message: "some fact 4", language: "english" },
      ]);

      expect(saveSpy).toHaveBeenCalledTimes(4);

      clearSpy.mockRestore();
      saveSpy.mockRestore();
    });

    test("should log that the input is empty", async () => {
      const warningSpy = jest
        .spyOn(logger, "warning")
        .mockImplementation(() => {});

      await welcomeFactService.saveFactList([]);

      expect(warningSpy).toHaveBeenCalledWith(
        "The list of WelcomeFacts is empty"
      );

      warningSpy.mockRestore(); 
    });
  });

  describe("getRandomFact() Tests", () => {
    test("should log that there are 0 facts", async () => {
      const warningSpy = jest
        .spyOn(logger, "warning")
        .mockImplementation(() => {});
      const querySpy = jest
        .spyOn(WelcomeFactEntity, "query")
        .mockImplementation(() =>
          Promise.resolve({ message: "fact", language: "english" })
        ); // returns a resolved Promise
      const countSpy = jest
        .spyOn(WelcomeFactEntity, "count")
        .mockImplementation(() => 0); // returns a resolved Promise

      await welcomeFactService.getRandomFact();

      expect(warningSpy).toHaveBeenCalledWith(
        "There are no welcome facts in the DB"
      );

      querySpy.mockRestore();
      warningSpy.mockRestore(); 
    });

    test("should work with french language", async () => {
      const warningSpy = jest
        .spyOn(logger, "warning")
        .mockImplementation(() => {});
      const querySpy = jest
        .spyOn(WelcomeFactEntity, "query")
        .mockImplementation(() =>
          Promise.resolve({ message: "fact", language: "french" })
        ); // returns a resolved Promise
      const countSpy = jest
        .spyOn(WelcomeFactEntity, "count")
        .mockImplementation(() => 3); // returns a resolved Promise

      await welcomeFactService.getRandomFact("french");

      querySpy.mockRestore();
      warningSpy.mockRestore(); 
    });

    test("should work with english language", async () => {
      const warningSpy = jest
        .spyOn(logger, "warning")
        .mockImplementation(() => {});
      const querySpy = jest
        .spyOn(WelcomeFactEntity, "query")
        .mockImplementation(() =>
          Promise.resolve({ message: "fact", language: "english" })
        ); // returns a resolved Promise
      const countSpy = jest
        .spyOn(WelcomeFactEntity, "count")
        .mockImplementation(() => 3); // returns a resolved Promise

      await welcomeFactService.getRandomFact("english");

      querySpy.mockRestore();
      warningSpy.mockRestore(); 
    });
  });
});
