import logger from "./logger";

export class MyError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
    logger.error(`${this.name}: ${this.message}`);
  }
}

export class InvalidEntityError extends MyError {
  constructor(message: string) {
    super(message, "InvalidEntityError");
  }
}

export class InvalidArgumentError extends MyError {
  constructor(message: string) {
    super(message, "InvalidArgumentError");
  }
}


export class EmptyStorageError extends MyError {
  constructor(message: string) {
    super(message, "EmptyStorageError");
  }
}

export class LocationAccessError extends MyError {
  constructor(message: string) {
    super(message, "LocationAccessError");
  }
}

export class PDFDownloadError extends Error {
  product_id: number;

  constructor(product_id: number, message = "Unable to download PDF. ") {
    super(message);
    this.name = "PDFDownloadError";
    this.product_id = product_id;
  }
}

export class PDFUpdateError extends Error {
  product_id: number;

  constructor(product_id: number, message = "Unable to update PDF.") {
    super(message);
    this.name = "PDFUpdateError";
    this.product_id = product_id;
  }
}

export class VaccineUpdateError extends Error {
  constructor(message = "Unable to update PDF.") {
    super(message);
    this.name = "VaccineUpdateError";
  }
}

export class VaccineListVersionError extends Error {
  constructor(message = "Remote list version behind local version") {
    super(message);
    this.name = "VaccineListVersionError";
  }
}

export class VaccineSearchError extends Error {
    constructor(message = "Problem searching for vaccines") {
      super(message);
      this.name = "VaccineSearchError";
    }
  }

export class NoInternetError extends Error {
  constructor(message = "No internet connection. Please try again later.") {
    super(message);
    this.name = "NoInternetError";
  }
}

  export class FetchError extends Error {
    url: string;
    constructor(url: string, message = "Problem pulling data from URL") {
      super(message);
      this.name = "FetchError";
      this.url = url;
    }
  }

  export class FactQueryError extends Error {
    constructor(message = "Unable to get fact") {
      super(message);
      this.name = "FactQueryError";
    }
  }

  export class RemoteFactError extends Error {
    constructor(message = "Problem getting the remote list of facts") {
      super(message);
      this.name = "RemoteFactError";
    }
  }


