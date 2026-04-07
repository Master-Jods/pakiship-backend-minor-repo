import type { Request } from "express";
import { CustomerProfileService } from "./customer-profile.service";
export declare class CustomerProfileController {
    private readonly customerProfileService;
    constructor(customerProfileService: CustomerProfileService);
    getProfile(request: Request): Promise<{
        profile: {
            id: any;
            fullName: any;
            email: any;
            phone: string;
            address: any;
            dob: any;
            city: any;
            province: any;
            profilePicture: any;
            preferences: {
                emailNotifications: boolean;
                smsUpdates: boolean;
                autoExtend: boolean;
            };
            discountIdUploaded: boolean;
            discountIdType: any;
            discountIdStatus: any;
            discountIdFileUrl: any;
            discountIdSubmittedAt: any;
            discountIdVerifiedAt: any;
            twoFactorEnabled: boolean;
            passwordUpdatedAt: any;
        };
        stats: {
            totalBookings: number;
            activeBookings: number;
            savedVehicles: number;
            accountCreated: string;
        };
        activity: {
            id: any;
            type: any;
            title: any;
            description: any;
            createdAt: any;
            timeLabel: string;
        }[];
    }>;
    getSavedRecipients(request: Request): Promise<{
        recipients: {
            id: string;
            name: string;
            phone: string;
            address: string;
            initial: string;
            frequency: number;
            lastUsed: string;
            createdAt: string;
        }[];
    }>;
    updateProfile(request: Request, body: Record<string, unknown>): Promise<{
        profile: {
            id: any;
            fullName: any;
            email: any;
            phone: string;
            address: any;
            dob: any;
            city: any;
            province: any;
            profilePicture: any;
            preferences: {
                emailNotifications: boolean;
                smsUpdates: boolean;
                autoExtend: boolean;
            };
            discountIdUploaded: boolean;
            discountIdType: any;
            discountIdStatus: any;
            discountIdFileUrl: any;
            discountIdSubmittedAt: any;
            discountIdVerifiedAt: any;
            twoFactorEnabled: boolean;
            passwordUpdatedAt: any;
        };
        stats: {
            totalBookings: number;
            activeBookings: number;
            savedVehicles: number;
            accountCreated: string;
        };
        activity: {
            id: any;
            type: any;
            title: any;
            description: any;
            createdAt: any;
            timeLabel: string;
        }[];
    }>;
    uploadAvatar(request: Request, file?: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    }): Promise<{
        profilePicture: string;
    }>;
    uploadDiscountId(request: Request, file?: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    }): Promise<{
        discountIdUploaded: boolean;
        discountIdStatus: "pending";
        discountIdType: string;
        discountIdFileUrl: string;
        discountIdSubmittedAt: string;
    }>;
    changePassword(request: Request, body: Record<string, unknown>): Promise<{
        profile: {
            id: any;
            fullName: any;
            email: any;
            phone: string;
            address: any;
            dob: any;
            city: any;
            province: any;
            profilePicture: any;
            preferences: {
                emailNotifications: boolean;
                smsUpdates: boolean;
                autoExtend: boolean;
            };
            discountIdUploaded: boolean;
            discountIdType: any;
            discountIdStatus: any;
            discountIdFileUrl: any;
            discountIdSubmittedAt: any;
            discountIdVerifiedAt: any;
            twoFactorEnabled: boolean;
            passwordUpdatedAt: any;
        };
        stats: {
            totalBookings: number;
            activeBookings: number;
            savedVehicles: number;
            accountCreated: string;
        };
        activity: {
            id: any;
            type: any;
            title: any;
            description: any;
            createdAt: any;
            timeLabel: string;
        }[];
    }>;
    quickSaveRecipient(request: Request, body: Record<string, unknown>): Promise<{
        recipient: {
            id: string;
            name: string;
            phone: string;
            address: string;
            initial: string;
            frequency: number;
            lastUsed: string;
            createdAt: string;
        };
        alreadySaved: boolean;
    }>;
    setupTwoFactor(request: Request): Promise<{
        secret: string;
        otpauthUri: string;
    }>;
    enableTwoFactor(request: Request, body: Record<string, unknown>): Promise<{
        profile: {
            id: any;
            fullName: any;
            email: any;
            phone: string;
            address: any;
            dob: any;
            city: any;
            province: any;
            profilePicture: any;
            preferences: {
                emailNotifications: boolean;
                smsUpdates: boolean;
                autoExtend: boolean;
            };
            discountIdUploaded: boolean;
            discountIdType: any;
            discountIdStatus: any;
            discountIdFileUrl: any;
            discountIdSubmittedAt: any;
            discountIdVerifiedAt: any;
            twoFactorEnabled: boolean;
            passwordUpdatedAt: any;
        };
        stats: {
            totalBookings: number;
            activeBookings: number;
            savedVehicles: number;
            accountCreated: string;
        };
        activity: {
            id: any;
            type: any;
            title: any;
            description: any;
            createdAt: any;
            timeLabel: string;
        }[];
    }>;
    disableTwoFactor(request: Request, body: Record<string, unknown>): Promise<{
        profile: {
            id: any;
            fullName: any;
            email: any;
            phone: string;
            address: any;
            dob: any;
            city: any;
            province: any;
            profilePicture: any;
            preferences: {
                emailNotifications: boolean;
                smsUpdates: boolean;
                autoExtend: boolean;
            };
            discountIdUploaded: boolean;
            discountIdType: any;
            discountIdStatus: any;
            discountIdFileUrl: any;
            discountIdSubmittedAt: any;
            discountIdVerifiedAt: any;
            twoFactorEnabled: boolean;
            passwordUpdatedAt: any;
        };
        stats: {
            totalBookings: number;
            activeBookings: number;
            savedVehicles: number;
            accountCreated: string;
        };
        activity: {
            id: any;
            type: any;
            title: any;
            description: any;
            createdAt: any;
            timeLabel: string;
        }[];
    }>;
}
