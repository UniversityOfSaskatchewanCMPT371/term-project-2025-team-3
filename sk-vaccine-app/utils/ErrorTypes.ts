export class InvalidArgumentError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "InvalidArgumentError";
    }
}


export class EmptyStorageError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EmptyStorageError";
    } 
}


export class LocationAccessError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "LocationAccessError";
    }
}