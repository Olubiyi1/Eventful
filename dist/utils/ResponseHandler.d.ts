import { Response } from "express";
declare class ResponseHandler {
    static ok(res: Response, message?: string, data?: unknown): Response<any, Record<string, any>>;
    static created(res: Response, message?: string, data?: unknown): Response<any, Record<string, any>>;
    static badRequest(res: Response, message?: string, errors?: unknown): Response<any, Record<string, any>>;
    static unauthorized(res: Response, message?: string): Response<any, Record<string, any>>;
    static forbidden(res: Response, message?: string): Response<any, Record<string, any>>;
    static notFound(res: Response, message?: string): Response<any, Record<string, any>>;
    static conflict(res: Response, message?: string): Response<any, Record<string, any>>;
    static serverError(res: Response, message?: string): Response<any, Record<string, any>>;
}
export default ResponseHandler;
