import { iWelcomeFactService, WelcomeFact } from "@/interfaces/iWelcomeFact";
import WelcomeFactEntity from "@/myorm/welcomeFact-entity";
import logger from "@/utils/logger";

export default class WelcomeFactService implements iWelcomeFactService {
  /**
   * Gets the fact list from the remote repo, this list contains string, lines that
   * start with '#', these need to be discarded.
   *
   * @returns a list of strings, these need to be parsed into facts and comments
   */
  async getRemoteFactList(): Promise<string[]> {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/ThompsonC-collab/immsapp-data/refs/heads/main/welcomeFacts.txt"
      );
      const factList = await response.text();
      return factList.split("\n");
    } catch (error) {
      throw new Error("Problem getting remote fact list");
    }
  }

  async saveFactList(list: WelcomeFact[]): Promise<void> {
    // Simply remove all other facts
    //WelcomeFactEntity.clear();

    // Add each fact into the database
    for (const fact of list) {
      logger.debug(fact);
      const factEntity = new WelcomeFactEntity(fact);
      await factEntity.save();
    }
  }

  async getRandomFact(
    language: "english" | "french" = "english"
  ): Promise<WelcomeFact> {
    try {
      const numberOfFacts = await WelcomeFactEntity.count();
      const randomN = Math.floor(Math.random() * numberOfFacts);

      const randomFact: WelcomeFact[] = await WelcomeFactEntity.query(
        `SELECT * FROM $table LIMIT 1 OFFSET ?`,
        [randomN]
      );

      return randomFact[0];
    } catch (error) {
      throw new Error("Unable to get fact");
    }
  }
}
