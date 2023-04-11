import ProtocolParameters from './models/ProtocolParameters.ts';

/**
 * Defines the list of protocol parameters, intended ONLY to be used within each version of Sidetree.
 */
const protocolParameters: ProtocolParameters = await import('./protocol-parameters.json', { assert: { type: "json" } });

export default protocolParameters;
