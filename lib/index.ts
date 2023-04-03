// NOTE: Aliases to classes and interfaces are used for external consumption.

import ISidetreeBitcoinConfig from './bitcoin/IBitcoinConfig.ts';
import ISidetreeBitcoinWallet from './bitcoin/interfaces/IBitcoinWallet.ts';
import ISidetreeBlockchain from './core/interfaces/IBlockchain.ts';
import ISidetreeCas from './core/interfaces/ICas.ts';
import ISidetreeEventEmitter from './common/interfaces/IEventEmitter.ts';
import ISidetreeLogger from './common/interfaces/ILogger.ts';
import SidetreeBitcoinEventCode from './bitcoin/EventCode.ts';
import SidetreeBitcoinMonitor from './bitcoin/Monitor.ts';
import SidetreeBitcoinProcessor from './bitcoin/BitcoinProcessor.ts';
import SidetreeBitcoinVersionModel from './bitcoin/models/BitcoinVersionModel.ts';
import SidetreeBlockchain from './core/Blockchain.ts';
import SidetreeBlockchainTimeModel from './core/models/BlockchainTimeModel.ts';
import SidetreeConfig from './core/models/Config.ts';
import SidetreeCore from './core/Core.ts';
import SidetreeEventCode from './core/EventCode.ts';
import SidetreeMonitor from './core/Monitor.ts';
import SidetreeResponse from './common/Response.ts';
import SidetreeResponseModel from './common/models/ResponseModel.ts';
import SidetreeServiceVersionModel from './common/models/ServiceVersionModel.ts';
import SidetreeTransactionModel from './common/models/TransactionModel.ts';
import SidetreeValueTimeLockModel from './common/models/ValueTimeLockModel.ts';
import SidetreeVersionModel from './core/models/VersionModel.ts';

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
