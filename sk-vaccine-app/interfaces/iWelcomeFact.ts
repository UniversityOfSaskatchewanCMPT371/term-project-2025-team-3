export type WelcomeFact = {
  message: string;
  language: "english" | "french";
};

export interface iWelcomeFactService {
  /**
   * Gets the fact list from the remote repo, this list contains string, lines that
   * start with '#', these need to be discarded. (currently only enlish)
   *
   * @precondition Connected to the internet
   *
   * @async
   * @returns A list of string from the remote repo, these need to be parsed
   * to remove comments
   * @throws RemoteFactError there is an issue retrieving the remote fact list
   */
  getRemoteFactList(): Promise<string[]>;

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
  saveFactList(list: WelcomeFact[]): Promise<void>;

  /**
   *
   * Gets a random fact from the WelcomeFact table.
   *
   * @precondition the WelcomeFact table must exist
   * @precondition A fact must exist in the database.
   *
   * @async
   *
   * @param language the language the fact should be in. Defaults to english !!NOT IMPLEMENTED!!
   * @returns a promise containng a 'random' fact
   *
   * @throws FaceQueryError if there is an issue with the WelcomeFaceEntity query.
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
   * Gets a fact from the database using the current language.
   *
   * If no fact is retrieved a standard message is sent as well as a flag
   * to tell the hook to rerun the function.
   *
   * @async
   * @returns An object containing the fact and whether the function should run again.
   * The second run is only needed on the first
   */
  getFact(): Promise<{ rerun: boolean; fact: string }>;
}
