"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
function compareOperation(op1, op2) {
    if (op1.transactionNumber < op2.transactionNumber) {
        return -1;
    }
    else if (op1.transactionNumber > op2.transactionNumber) {
        return 1;
    }
    else if (op1.operationIndex < op2.operationIndex) {
        return -1;
    }
    else if (op1.operationIndex > op2.operationIndex) {
        return 1;
    }
    return 0;
}
class MockOperationStore {
    constructor() {
        this.didToOperations = new Map();
        this.didUpdatedSinceLastSort = new Map();
    }
    insert(operation) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.ensureDidContainerExist(operation.didUniqueSuffix);
            this.didToOperations.get(operation.didUniqueSuffix).push(operation);
            this.didUpdatedSinceLastSort.set(operation.didUniqueSuffix, true);
        });
    }
    insertOrReplace(operations) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const operation of operations) {
                yield this.insert(operation);
            }
        });
    }
    get(didUniqueSuffix) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let didOps = this.didToOperations.get(didUniqueSuffix);
            if (!didOps) {
                return [];
            }
            const updatedSinceLastSort = this.didUpdatedSinceLastSort.get(didUniqueSuffix);
            if (updatedSinceLastSort) {
                didOps.sort(compareOperation);
                didOps = didOps.filter((elem, index, self) => {
                    return (index === 0) || compareOperation(elem, self[index - 1]) !== 0;
                });
                this.didUpdatedSinceLastSort.set(didUniqueSuffix, false);
            }
            return didOps;
        });
    }
    delete(transactionNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!transactionNumber) {
                this.didToOperations.clear();
                this.didUpdatedSinceLastSort.clear();
                return;
            }
            for (const [, didOps] of this.didToOperations) {
                MockOperationStore.removeOperations(didOps, transactionNumber);
            }
        });
    }
    deleteUpdatesEarlierThan(_didUniqueSuffix, _transactionNumber, _operationIndex) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () { });
    }
    static removeOperations(operations, transactionNumber) {
        let writeIndex = 0;
        for (let i = 0; i < operations.length; i++) {
            if (operations[i].transactionNumber <= transactionNumber) {
                operations[writeIndex++] = operations[i];
            }
        }
        while (operations.length > writeIndex) {
            operations.pop();
        }
    }
    ensureDidContainerExist(did) {
        if (this.didToOperations.get(did) === undefined) {
            this.didToOperations.set(did, []);
            this.didUpdatedSinceLastSort.set(did, false);
        }
    }
}
exports.default = MockOperationStore;
//# sourceMappingURL=MockOperationStore.js.map