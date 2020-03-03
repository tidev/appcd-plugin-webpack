'use strict';

/* global __resourceQuery */

const stripAnsi = require('strip-ansi');
const socket = require('./socket');
const { log } = require('./utils/log');
const reloadApp = require('./utils/reloadApp');

/*
const overlay = require('./overlay');
const sendMessage = require('./utils/sendMessage');
*/

const status = {
	isUnloading: false,
	currentHash: '',
};
const options = {
	hot: false,
	hotReload: true,
	liveReload: false,
	initial: true,
	useWarningOverlay: false,
	useErrorOverlay: false,
	useProgress: false,
};
// const socketUrl = createSocketUrl(__resourceQuery);
const socketUrl = __resourceQuery.substr(1);

const onSocketMessage = {
	hot() {
		options.hot = true;
		log.info('[WDS] Hot Module Replacement enabled.');
	},
	liveReload() {
		options.liveReload = true;
		log.info('[WDS] Live Reloading enabled.');
	},
	invalid() {
		log.info('[WDS] App updated. Recompiling...');
	},
	hash(hash) {
		status.currentHash = hash;
	},
	'still-ok': function stillOk() {
		log.info('[WDS] Nothing changed.');
	},
	'log-level': function logLevel(level) {
		log.info('[WDS] Changing log level is not supported yet.', level);
	},
	overlay(value) {
		// overlay not supported yet
	},
	progress(progress) {
		// progress not supported yet
	},
	'progress-update': function progressUpdate(data) {
		// progress-update not supported yet
	},
	ok() {
		if (options.initial) {
			options.initial = false;
			return;
		}

		reloadApp(options, status);
	},
	'content-changed': function contentChanged() {
		log.info('[WDS] Content base option is not supported.');
	},
	warnings(warnings) {
		log.warn('[WDS] Warnings while compiling.');
		const strippedWarnings = warnings.map((warning) => stripAnsi(warning));
		for (let i = 0; i < strippedWarnings.length; i++) {
			log.warn(strippedWarnings[i]);
		}

		if (options.initial) {
			return (options.initial = false);
		}

		reloadApp(options, status);
	},
	errors(errors) {
		log.error('[WDS] Errors while compiling. Reload prevented.');
		const strippedErrors = errors.map((error) => stripAnsi(error));
		for (let i = 0; i < strippedErrors.length; i++) {
			log.error(strippedErrors[i]);
		}
		options.initial = false;
	},
	error(error) {
		log.error(error);
	},
	close() {
		log.error('[WDS] Disconnected!');
	}
};

socket(socketUrl, onSocketMessage);
