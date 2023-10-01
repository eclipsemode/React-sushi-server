import {Error} from "sequelize";

interface IError {
  name: string,
  description: string
}

class ApiError extends Error{
  public status: number;
  public errors: IError[];
  constructor(status: number, message: string, errors: IError[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message: string, errors: IError[] = []) {
    return new ApiError(404, message, errors);
  }

  static unauthorized(message = 'Необходимо авторизоваться.', errors: IError[] = []) {
    return new ApiError(401, message, errors);
  }

  static internal(message: string, errors: IError[] = []) {
    return new ApiError(500, message, errors);
  }

  static forbidden(message: string, errors: IError[] = []) {
    return new ApiError(403, message, errors);
  }
}

export default ApiError;