import Config from '../../lib/core/models/Config';
export default class MongoDb {
    private static initialized;
    static createInmemoryDb(config: Config): Promise<void>;
}
