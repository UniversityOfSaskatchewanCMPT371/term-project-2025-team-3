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