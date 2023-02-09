import ServiceVersionModel from './models/ServiceVersionModel';
export default class ServiceInfoProvider {
    private static readonly packageJson;
    private serviceName;
    constructor(serviceName: string);
    getServiceVersion(): ServiceVersionModel;
}
