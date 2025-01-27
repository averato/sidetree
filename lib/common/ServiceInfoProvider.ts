import ServiceVersionModel from './models/ServiceVersionModel.ts';
/**
 * Encapsulates the functionality to get the information about the service such as
 * version info.
 */
export default class ServiceInfoProvider {

  private static readonly packageJson = JSON.parse(Deno.readTextFileSync('./package.json'));
  private serviceName: string;

  constructor (serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Gets the service version from the package.json file.
   */
  public getServiceVersion (): ServiceVersionModel {
    return {
      name: this.serviceName,
      version: ServiceInfoProvider.packageJson.version
    };
  }
}
