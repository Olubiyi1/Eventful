declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    status: string;
    constructor(message: string, statusCode: number);
}
export default AppError;
