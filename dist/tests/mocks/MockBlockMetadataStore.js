"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class MockBlockMetadataStore {
    constructor() {
        this.store = [];
    }
    add(blockMetadata) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.store.push(...blockMetadata);
        });
    }
    removeLaterThan(blockHeight) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (blockHeight !== undefined) {
                this.store = this.store.filter((block) => { return block.height < blockHeight; });
            }
        });
    }
    get(fromInclusiveHeight, toExclusiveHeight) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const sortedStore = this.store.sort((a, b) => { return a.height - b.height; });
            return sortedStore.filter((block) => { return block.height >= fromInclusiveHeight && block.height < toExclusiveHeight; });
        });
    }
    getLast() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const sortedStore = this.store.sort((a, b) => { return a.height - b.height; });
            return sortedStore[sortedStore.length - 1];
        });
    }
    lookBackExponentially() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.warn('lookBackExponentially always returns empty array. Use spy to override this.');
            return [];
        });
    }
}
exports.default = MockBlockMetadataStore;
//# sourceMappingURL=MockBlockMetadataStore.js.map