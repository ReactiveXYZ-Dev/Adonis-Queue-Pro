/**
 * Utility functions
 *
 * @version 1.0.0
 * @adonis-version 3.2
 */

const fs = require('fs');
const fse = require('fs-extra');
const mkdirp = require('mkdirp');

module.exports = {

	dirExistsSync: path => {

		return fs.existsSync(path);

	},

	createDir: path => {

		return new Promise((resolve, reject) => {

			mkdirp(path, err => {

				if (err) {
					reject(err);
				} else {
					resolve()
				}

			});

		});

	},

	copyFile: (src, dest) => {

		return new Promise((resolve, reject) => {

			fse.copy(src, dest, err => {

				if (err) {
					reject(err);
				} else {
					resolve();
				}

			});

		});

	},

	readFile: (src, options) => {

		return new Promise((resolve, reject) => {

			fs.readFile(src, options, (err, data) => {

				if (err) {
					reject(err);
				} else {
					resolve(data);
				}

			});

		});

	},

	writeFile: (dest, content, options) => {

		return new Promise((resolve, reject) => {

			fs.writeFile(dest, content, options, err => {

				if (err) {
					reject(err);
				} else {
					resolve();
				}

			});

		});

	}

};