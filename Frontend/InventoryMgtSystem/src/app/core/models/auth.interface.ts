export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
        name: string;
        email: string;
        role: string;
        epf_No?: string;
        active?: boolean;
    };
}
