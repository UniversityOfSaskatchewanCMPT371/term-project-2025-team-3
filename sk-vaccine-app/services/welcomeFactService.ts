import { iWelcomeFactService, WelcomeFact } from "@/interfaces/iWelcomeFact";
import WelcomeFactEntity from "@/myorm/welcomeFact-entity";
import { FactQueryError, RemoteFactError } from "@/utils/ErrorTypes";
import logger from "@/utils/logger";
import assert from "assert";

export class WelcomeFactService implements iWelcomeFactService {
  /**
   * Gets the fact list from the remote repo, this list contains string, lines that
   * start with '#', these need to be discarded. (currently only enlish)
   *
   * @precondition Connected to the internet
   *
   * @returns A list of string from the remote repo, these need to be parsed
   * to remove comments
   * * @throws RemoteFactError there is an issue retrieving the remote fact list
   */
  async getRemoteFactList(): Promise<string[]> {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/ThompsonC-collab/immsapp-data/refs/heads/main/welcomeFacts.txt"
      );
      const factList = await response.text();
      return factList.split("\n");
    } catch (error) {
      throw new RemoteFactError();
    }
  }

  /**
   * Wipes the current fact list and saves the new one to the database.
   *
   * This works because the random fact is retrieved before the table is
   * cleared.
   *
   * @precondition list cannot be empty
   * @async
   * @param list The list of facts to save into the database
   */
  async saveFactList(list: WelcomeFact[]): Promise<void> {
    assert(list.length > 0, "The list of WelcomeFacts cannot be empty");
    // Simply remove all other facts
    WelcomeFactEntity.clear();

    // Add each fact into the database
    for (const fact of list) {
      logger.debug(fact);
      const factEntity = new WelcomeFactEntity(fact);
      await factEntity.save();
    }
  }

  /**
  *
  * Gets a random fact from the WelcomeFact table.
  *
  * @precondition the WelcomeFact table must exist
  * @precondition A fact must exist in the database.
  *
  * @param language the language the fact should be in. Defaults to english !!NOT IMPLEMENTED!!
  * @returns a promise containng a 'random' fact
  *
  * @throws FaceQueryError if there is an issue with the WelcomeFaceEntity query.
  */
  async getRandomFact(
    language: "english" | "french" = "english"
  ): Promise<WelcomeFact> {
    try {
      const numberOfFacts = await WelcomeFactEntity.count();
      assert(
        numberOfFacts > 0,
        "There should always be a fact if the table exists"
      );
      const randomN = Math.floor(Math.random() * numberOfFacts);

      const randomFact: WelcomeFact[] = await WelcomeFactEntity.query(
        `SELECT * FROM $table LIMIT 1 OFFSET ?`,
        [randomN]
      );

      return randomFact[0];
    } catch (error) {
      throw new FactQueryError();
    }
  }
}
