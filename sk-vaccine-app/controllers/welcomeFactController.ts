import { iWelcomeFactController, WelcomeFact } from "@/interfaces/iWelcomeFact";
import WelcomeFactService from "@/services/welcomeFactService";
import logger from "@/utils/logger";

export class WelcomeFactController implements iWelcomeFactController {
  private welcomeService: WelcomeFactService;

  constructor() {
    this.welcomeService = new WelcomeFactService();
  }

  /**
   * Gets and parses the remote fact list, then updates the
   * local fact list.
   *
   * @precondition Requires an internet connection
   *
   * @returns the number of facts
   *
   */
  async updateFactList(): Promise<number> {
    const factLines = await this.welcomeService.getRemoteFactList();
    const welcomeFacts: WelcomeFact[] = factLines.flatMap((line) => {
      const trimmedLine = line.trim();
      // Currently english be default as no languages services have
      // been fully implemented
      return trimmedLine && !trimmedLine.startsWith("#")
        ? [{ message: trimmedLine, language: "english" }]
        : [];
    });
    logger.debug(welcomeFacts);
    await this.welcomeService.saveFactList(welcomeFacts);
    return welcomeFacts.length;
  }

  /**
   * Gets a fact from the database using the current language.
   * 
   * If no fact is retrieved a standard message is sent as well as a flag
   * to tell the hook to rerun the function.
   * 
   * @returns An object containing the fact and whether the function should run again.
   * The second run is only needed on the first
   */
  async getFact(): Promise<{ rerun: boolean; fact: string; }> {
    try {
      const fact = (await this.welcomeService.getRandomFact()).message;
      if (fact === undefined) {
        return {rerun: true, fact: "To get started, please ensure you have an internet connection!"};
      }
      return { rerun: false, fact: fact }
    } catch (error) {
      logger.error("Problem getting a fact, displaying default.", error);
      return {rerun: true, fact: "To get started, please ensure you have an internet connection!"};
    }
  }
}
