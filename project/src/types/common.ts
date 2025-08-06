export type Result<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code?: string;
};

export type AsyncResult<T> = Promise<Result<T>>;

// Utility functions for working with Result type
export const createSuccess = <T>(data: T): Result<T> => ({
  success: true,
  data
});

export const createError = <T>(error: string, code?: string): Result<T> => ({
  success: false,
  error,
  code
});

// Type guards
export const isSuccess = <T>(result: Result<T>): result is { success: true; data: T } => {
  return result.success;
};

export const isError = <T>(result: Result<T>): result is { success: false; error: string; code?: string } => {
  return !result.success;
};

// Helper to extract data or throw
export const unwrap = <T>(result: Result<T>): T => {
  if (isSuccess(result)) {
    return result.data;
  }
  throw new Error(result.error);
};

// Helper to extract data or return default
export const unwrapOr = <T>(result: Result<T>, defaultValue: T): T => {
  return isSuccess(result) ? result.data : defaultValue;
};