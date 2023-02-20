"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Logger_1 = require("../common/Logger");
const SidetreeError_1 = require("../common/SidetreeError");
class SidetreeTransactionParser {
    constructor(bitcoinClient, sidetreePrefix) {
        this.bitcoinClient = bitcoinClient;
        this.sidetreePrefix = sidetreePrefix;
    }
    parse(bitcoinTransaction) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const sidetreeData = this.getValidSidetreeDataFromOutputs(bitcoinTransaction.outputs, this.sidetreePrefix);
            if (!sidetreeData) {
                return undefined;
            }
            const writer = yield this.getValidWriterFromInputs(bitcoinTransaction.id, bitcoinTransaction.inputs);
            if (!writer) {
                Logger_1.default.info(`Valid sidetree data was found but no valid writer was found for transaction id: ${bitcoinTransaction.id}`);
                return undefined;
            }
            return {
                data: sidetreeData,
                writer: writer
            };
        });
    }
    getValidSidetreeDataFromOutputs(transactionOutputs, sidetreePrefix) {
        for (let i = 0; i < transactionOutputs.length; i++) {
            const currentOutput = transactionOutputs[i];
            const sidetreeDataForThisOutput = this.getSidetreeDataFromOutputIfExist(currentOutput, sidetreePrefix);
            if (sidetreeDataForThisOutput) {
                return sidetreeDataForThisOutput;
            }
        }
        return undefined;
    }
    getSidetreeDataFromOutputIfExist(transactionOutput, sidetreePrefix) {
        const hexDataMatches = transactionOutput.scriptAsmAsString.match(/\s*OP_RETURN ([0-9a-fA-F]+)$/);
        if (hexDataMatches && hexDataMatches.length !== 0) {
            const data = Buffer.from(hexDataMatches[1], 'hex').toString();
            if (data.startsWith(sidetreePrefix)) {
                return data.slice(sidetreePrefix.length);
            }
        }
        return undefined;
    }
    getValidWriterFromInputs(transactionId, transactionInputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (transactionInputs.length < 1) {
                Logger_1.default.info(`There must be at least one input in the transaction id: ${transactionId}`);
                return undefined;
            }
            const inputToCheck = transactionInputs[0];
            const inputScriptAsmParts = inputToCheck.scriptAsmAsString.split(' ');
            if (inputScriptAsmParts.length !== 2) {
                Logger_1.default.info(`The first input must have only the signature and publickey; transaction id: ${transactionId}`);
                return undefined;
            }
            const outputBeingSpend = yield this.fetchOutput(inputToCheck.previousTransactionId, inputToCheck.outputIndexInPreviousTransaction);
            if (!outputBeingSpend) {
                return undefined;
            }
            return this.getPublicKeyHashIfValidScript(outputBeingSpend.scriptAsmAsString);
        });
    }
    fetchOutput(transactionId, outputIndexToFetch) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.bitcoinClient.getRawTransaction(transactionId);
                return transaction.outputs[outputIndexToFetch];
            }
            catch (e) {
                if (e instanceof SidetreeError_1.default)
                    Logger_1.default.error(`Error while trying to get outputIdx: ${outputIndexToFetch} from transaction: ${transactionId}. Error: ${SidetreeError_1.default.stringify(e)}`);
                throw e;
            }
        });
    }
    getPublicKeyHashIfValidScript(scriptAsm) {
        const scriptAsmParts = scriptAsm.split(' ');
        const isScriptValid = scriptAsmParts.length === 5 &&
            scriptAsmParts[0] === 'OP_DUP' &&
            scriptAsmParts[1] === 'OP_HASH160' &&
            scriptAsmParts[3] === 'OP_EQUALVERIFY' &&
            scriptAsmParts[4] === 'OP_CHECKSIG';
        return isScriptValid ? scriptAsmParts[2] : undefined;
    }
}
exports.default = SidetreeTransactionParser;
//# sourceMappingURL=SidetreeTransactionParser.js.map