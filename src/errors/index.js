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
}

class JobDirectoryNotFoundException extends BaseError {}
class JobProcessError extends BaseError {}

module.exports = {
    JobDirectoryNotFoundException,
    JobProcessError
}
