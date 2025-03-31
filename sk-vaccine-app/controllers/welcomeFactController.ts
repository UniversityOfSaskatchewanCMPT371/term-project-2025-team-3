import { iWelcomeFactController, WelcomeFact } from "@/interfaces/iWelcomeFact";
import WelcomeFactService from "@/services/welcomeFactService";
import logger from "@/utils/logger";

export class WelcomeFactController implements iWelcomeFactController {
  private welcomeService: WelcomeFactService;

  constructor() {
    this.welcomeService = new WelcomeFactService();
  }

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
   *
   * @returns
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
