'use strict';

/* global Ti */

const { log } = require('./log');

function reloadApp(
	{ hotReload, hot, liveReload },
	{ isUnloading, currentHash }
) {
	if (isUnloading || !hotReload) {
		return;
	}
	if (hot) {
		log.info('[WDS] App hot update...');
		const hotEmitter = require('webpack/hot/emitter');
		hotEmitter.emit('webpackHotUpdate', currentHash);
	} else if (liveReload) {
		// allow refreshing the app only if liveReload isn't disabled
		log.info('[WDS] App updated. Reloading...');
		Ti.App._restart();
	}
}

module.exports = reloadApp;
