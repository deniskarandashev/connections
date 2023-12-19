export interface AppState {
    user: User
}

export interface User extends LoginRequest, LoginResponse {
    name: string,
    loggedIn?: boolean,
    createdAt?: string
}

export interface BaseResponseError {
    type: string,
    message: string
}

export interface LoginRequest {
    email?: string,
    password?: string
}

export interface LoginResponse {
    token?: string,
    uid?: string
}

export interface Profile {
    createdAt: ProfilePart,
    email: ProfilePart,
    name: ProfilePart, 
    uid: ProfilePart
}

interface ProfilePart {
    S: string
}