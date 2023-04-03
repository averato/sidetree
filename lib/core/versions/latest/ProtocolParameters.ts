import ProtocolParameters from './models/ProtocolParameters.ts';

/**
 * Defines the list of protocol parameters, intended ONLY to be used within each version of Sidetree.
 */
const protocolParameters: ProtocolParameters = require('./protocol-parameters.json');

export default protocolParameters;
