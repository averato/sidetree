export default class TypedError extends Error {
    type: string;
    constructor(type: string);
}
