export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    responsCode: number;
    result: {
        token: string;
        user: {
            id: number;
            username: string;
            name: string;
            email: string;
            role: string;
        };
    };
}
