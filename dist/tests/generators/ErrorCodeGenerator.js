'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const fs = require('fs');
const path = require('path');
const ErrorCode_1 = require('../../lib/core/versions/latest/ErrorCode');
const errorCodeFileName = 'ErrorCode.ts';
const latestVersionPath = '../../../lib/core/versions/latest';
const latestVersionDirectory = path.resolve(__dirname, latestVersionPath);
const saveLocation = path.resolve(__dirname, `${latestVersionPath}/${errorCodeFileName}`);
function isErrorCodeReferencedInDicrectory (errorCode, path) {
  const directory = fs.readdirSync(path);
  for (const fileOrSubDirectory of directory) {
    if (isErrorCodeFile(fileOrSubDirectory)) {
      continue;
    } else if (isTsFile(fileOrSubDirectory)) {
      const file = fs.readFileSync(`${path}/${fileOrSubDirectory}`, 'utf-8');
      if (file.includes(errorCode)) {
        return true;
      }
    } else if (!fileOrSubDirectory.includes('.')) {
      try {
        if (isErrorCodeReferencedInDicrectory(errorCode, `${path}/${fileOrSubDirectory}`)) {
          return true;
        }
      } catch (e) {
      }
    }
  }
  return false;
}
function isTsFile (fileName) {
  return fileName.includes('.ts');
}
function isErrorCodeFile (fileName) {
  return fileName === 'ErrorCode.ts';
}
(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  let errorCodeFileContent = `/**
 * Error codes used ONLY by this version of the protocol.
 */
export default {
`;
  const errorCodeNames = [];
  for (var code in ErrorCode_1.default) {
    if (isNaN(Number(code))) {
      errorCodeNames.push(code);
    }
  }
  errorCodeNames.sort();
  for (let i = 0; i < errorCodeNames.length; i++) {
    if (isErrorCodeReferencedInDicrectory(errorCodeNames[i], latestVersionDirectory)) {
      const camelCaseErrorMessage = errorCodeNames[i].replace(/\.?([A-Z])/g, function (_x, y) { return '_' + y.toLowerCase(); }).replace(/^_/, '');
      if (i === errorCodeNames.length - 1) {
        errorCodeFileContent += `  ${errorCodeNames[i]}: '${camelCaseErrorMessage}'\n`;
      } else {
        errorCodeFileContent += `  ${errorCodeNames[i]}: '${camelCaseErrorMessage}',\n`;
      }
    } else {
      console.info(`${errorCodeNames[i]} is removed from ErrorCode because it is not used.`);
    }
    ;
  }
  errorCodeFileContent +=
        `};
`;
  fs.writeFileSync(`${saveLocation}`, errorCodeFileContent);
}))();
// # sourceMappingURL=ErrorCodeGenerator.js.map
