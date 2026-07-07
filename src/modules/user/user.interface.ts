import { ActiveStatus, Role } from "../../../generated/prisma/enums";

export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    profilePhoto?: string;
    role : Role
    phone : string
}

export interface IUpdateUserStatusPayload {
    name?: string;
    email?: string;
    password?: string;
    profilePhoto?: string;
    role? : Role
    phone ?: string
    activeStatus: ActiveStatus;
}