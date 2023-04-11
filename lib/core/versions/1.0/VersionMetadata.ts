import AbstractVersionMetadata from '../../abstracts/AbstractVersionMetadata.ts';
import ProtocolParameters from './ProtocolParameters.ts';

/**
 * Implementation of the abstract VersionMetadata.
 */
export default class VersionMetadata extends AbstractVersionMetadata {
  public normalizedFeeToPerOperationFeeMultiplier: number;
  public valueTimeLockAmountMultiplier: number;
  public constructor () {
    super();
    this.normalizedFeeToPerOperationFeeMultiplier = ProtocolParameters.normalizedFeeToPerOperationFeeMultiplier;
    this.valueTimeLockAmountMultiplier = ProtocolParameters.valueTimeLockAmountMultiplier;
  }
}
