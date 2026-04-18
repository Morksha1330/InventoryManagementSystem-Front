export interface HttpResponseData<T> {
    result: T;
    results?: T[];
    responsCode: number;
    error?: string;
    success: boolean;
    message?: string;
}