/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/ntt/sm/hwproject/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});