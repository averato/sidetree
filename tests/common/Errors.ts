

export default class TypedError extends Error {
  public type: string;

  constructor(type: string) {
    super(type);
    this.type = type;
  }
}
