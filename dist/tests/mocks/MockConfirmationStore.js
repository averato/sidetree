"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class MockConfirmationStore {
    constructor() {
        this.entries = [];
    }
    clear() {
        this.entries = [];
    }
    confirm(anchorString, confirmedAt) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const found = this.entries.find(entry => entry.anchorString === anchorString);
            if (found !== undefined) {
                found.confirmedAt = confirmedAt;
            }
        });
    }
    getLastSubmitted() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const sorted = this.entries.sort((a, b) => b.submittedAt - a.submittedAt);
            if (sorted.length === 0) {
                return undefined;
            }
            else {
                return sorted[0];
            }
        });
    }
    submit(anchorString, submittedAt) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.entries.push({
                anchorString,
                submittedAt,
                confirmedAt: undefined
            });
        });
    }
    resetAfter(confirmedAt) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.entries.forEach((entry) => {
                if (confirmedAt === undefined || (entry.confirmedAt && entry.confirmedAt > confirmedAt)) {
                    entry.confirmedAt = undefined;
                }
            });
        });
    }
}
exports.default = MockConfirmationStore;
//# sourceMappingURL=MockConfirmationStore.js.map