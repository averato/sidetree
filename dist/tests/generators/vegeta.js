"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const VegetaLoadGenerator_1 = require("./VegetaLoadGenerator");
const uniqueDidCount = 20000;
const endpointUrl = 'http://localhost:3000/';
const outputFolder = `d:/vegeta-localhost-jws`;
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.info(`Generating load requests...`);
    const startTime = process.hrtime();
    yield VegetaLoadGenerator_1.default.generateLoadFiles(uniqueDidCount, endpointUrl, outputFolder);
    const duration = process.hrtime(startTime);
    console.info(`Generated requests. Time taken: ${duration[0]} s ${duration[1] / 1000000} ms.`);
}))();
//# sourceMappingURL=vegeta.js.map