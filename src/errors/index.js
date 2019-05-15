'use strict'

/**
 * Miscellaneous custom errors
 */

class BaseError extends Error {
    constructor(message) {
        super(message);
    }

    setError(error) {
        this.error = error;
        return this;
    }

    getError() {
        return this.error;
    }

    updateMessage() {
        let message = this.message;
        if (this.error) message += ` (src err: ${this.error.message})`;
        this.message = message;
        return this;
    }
}

class JobDirectoryNotFoundError extends BaseError {}
class JobProcessError extends BaseError {}
class JobFetchError extends BaseError {}

module.exports = {
    JobDirectoryNotFoundError,
    JobProcessError,
    JobFetchError
}
