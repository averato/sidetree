// NOTE: Aliases to classes and interfaces are used for external consumption.

import { type IBitcoinConfig as ISidetreeBitcoinConfig } from './bitcoin/IBitcoinConfig.ts';
import type ISidetreeBitcoinWallet from './bitcoin/interfaces/IBitcoinWallet.ts';
import type ISidetreeBlockchain from './core/interfaces/IBlockchain.ts';
import type ISidetreeCas from './core/interfaces/ICas.ts';
import type ISidetreeEventEmitter from './common/interfaces/IEventEmitter.ts';
import type ISidetreeLogger from './common/interfaces/ILogger.ts';
import SidetreeBitcoinEventCode from './bitcoin/EventCode.ts';
import SidetreeBitcoinMonitor from './bitcoin/Monitor.ts';
import SidetreeBitcoinProcessor from './bitcoin/BitcoinProcessor.ts';
import { type BitcoinVersionModel as SidetreeBitcoinVersionModel } from './bitcoin/models/BitcoinVersionModel.ts';
import SidetreeBlockchain from './core/Blockchain.ts';
import { type BlockchainTimeModel as SidetreeBlockchainTimeModel } from './core/models/BlockchainTimeModel.ts';
import type SidetreeConfig from './core/models/Config.ts';
import SidetreeCore from './core/Core.ts';
import SidetreeEventCode from './core/EventCode.ts';
import SidetreeMonitor from './core/Monitor.ts';
import SidetreeResponse from './common/Response.ts';
import type SidetreeResponseModel from './common/models/ResponseModel.ts';
import type SidetreeServiceVersionModel from './common/models/ServiceVersionModel.ts';
import type SidetreeTransactionModel from './common/models/TransactionModel.ts';
import type SidetreeValueTimeLockModel from './common/models/ValueTimeLockModel.ts';
import type SidetreeVersionModel from './core/models/VersionModel.ts';

// Core service exports.
export {
  ISidetreeCas,
  SidetreeConfig,
  SidetreeCore,
  SidetreeEventCode,
  SidetreeMonitor,
  SidetreeResponse,
  SidetreeResponseModel,
  SidetreeVersionModel
};

// Blockchain service exports.
export {
  ISidetreeBitcoinConfig,
  ISidetreeBitcoinWallet,
  ISidetreeBlockchain,
  SidetreeBitcoinEventCode,
  SidetreeBitcoinMonitor,
  SidetreeBitcoinProcessor,
  SidetreeBitcoinVersionModel,
  SidetreeBlockchain,
  SidetreeBlockchainTimeModel
};
 
// Common exports.
export {
  ISidetreeEventEmitter,
  ISidetreeLogger,
  SidetreeServiceVersionModel,
  SidetreeTransactionModel,
  SidetreeValueTimeLockModel
};
