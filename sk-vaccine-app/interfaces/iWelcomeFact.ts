export type WelcomeFact = {
  message: string;
  language: "english" | "french";
};

export interface iWelcomeFactService {
  /**
   *
   * Fetches the remote list of welcome facts (currently only enlish)
   *
   * @precondition internet connection required
   *
   * @returns A list of string from the remote repo, these need to be parsed
   * to remove comments
   */
  getRemoteFactList(): Promise<string[]>;

  /**
   *
   * Save a list of facts into the database
   *
   * @precondition list cannot be empty
   * @async
   * @param list The list of facts to save into the database
   */
  saveFactList(list: WelcomeFact[]): Promise<void>;

  /**
   *
   * Gets a random fact from the fact list to be displayed on the
   * home page
   *
   * @precondition A fact must exist in the database.
   * @async
   * @param language the language the fact should be in. Defaults to english
   *
   */
  getRandomFact(language: "english" | "french"): Promise<WelcomeFact>;
}

export interface iWelcomeFactController {
  /**
   * Gets and parses the remote fact list, then updates the
   * local fact list.
   *
   * @async
   * @precondition Requires an internet connection
   *
   * @returns the number of facts
   *
   */
  updateFactList(): Promise<number>;

  /**
   * Gets a fact from the database using the current language
   * If no facts currently exist then a first time startup message is
   * returned.
   *
   *
   * @async
   * @returns A fact in the form of a string;
   */
  getFact(): Promise<{ rerun: boolean; fact: string }>;
}
