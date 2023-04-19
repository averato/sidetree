import ProtocolParameters from './models/ProtocolParameters.ts';

/**
 * Defines the list of protocol parameters, intended ONLY to be used within each version of Sidetree.
 */
const protocolParameters: ProtocolParameters = JSON.parse(Deno.readTextFileSync('./protocol-parameters.json'));
export default protocolParameters;
