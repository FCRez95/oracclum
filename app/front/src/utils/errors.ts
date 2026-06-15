export class APIError extends Error {
    status: number;
    detail?: string;

    constructor(message: string, status = 500, detail?: string) {
        super(message);
        this.name = "APIError";
        this.status = status;
        this.detail = detail;
    }
}