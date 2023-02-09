/// <reference types="node" />
export default class JsonAsync {
    static parse(jsonData: Buffer | string): Promise<any>;
}
