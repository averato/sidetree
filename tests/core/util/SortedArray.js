'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
class SortedArray {
  static binarySearch (sortedArray, searchItem, compare) {
    let lowerBoundaryIndex = 0;
    let upperBoundaryIndex = sortedArray.length - 1;
    let middleIndex = 0;
    while (lowerBoundaryIndex <= upperBoundaryIndex) {
      middleIndex = Math.floor((lowerBoundaryIndex + upperBoundaryIndex) / 2);
      const comparisonResult = compare(sortedArray[middleIndex], searchItem);
      if (comparisonResult > 0) {
        upperBoundaryIndex = middleIndex - 1;
      } else if (comparisonResult < 0) {
        lowerBoundaryIndex = middleIndex + 1;
      } else {
        return middleIndex;
      }
    }
    return undefined;
  }
}
exports.default = SortedArray;
// # sourceMappingURL=SortedArray.js.map
