import type { SessionPayload } from "../common/session/session.types";
import { CustomerNotificationsService } from "../customer-notifications/customer-notifications.service";
import { SupabaseService } from "../supabase/supabase.service";
type CustomerPreferences = {
    emailNotifications: boolean;
    smsUpdates: boolean;
    autoExtend: boolean;
};
type UploadedFile = {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
};
type UpdateCustomerProfileInput = {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    dob?: string;
    preferences?: Partial<CustomerPreferences>;
};
type QuickSaveRecipientInput = {
    name: string;
    phone: string;
};
export declare class CustomerProfileService {
    private readonly supabaseService;
    private readonly customerNotificationsService;
    constructor(supabaseService: SupabaseService, customerNotificationsService: CustomerNotificationsService);
    private ensureStorageBucket;
    getCustomerProfile(session: SessionPayload): Promise<{
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
            preferences: CustomerPreferences;
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
    updateCustomerProfile(session: SessionPayload, input: UpdateCustomerProfileInput): Promise<{
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
            preferences: CustomerPreferences;
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
    getSavedRecipients(session: SessionPayload): Promise<{
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
    quickSaveRecipient(session: SessionPayload, input: QuickSaveRecipientInput): Promise<{
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
    uploadProfilePicture(session: SessionPayload, file: UploadedFile | undefined): Promise<{
        profilePicture: string;
    }>;
    uploadDiscountId(session: SessionPayload, file: UploadedFile | undefined): Promise<{
        discountIdUploaded: boolean;
        discountIdStatus: "pending";
        discountIdType: string;
        discountIdFileUrl: string;
        discountIdSubmittedAt: string;
    }>;
    changePassword(session: SessionPayload, currentPassword: string, newPassword: string): Promise<{
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
            preferences: CustomerPreferences;
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
    createTwoFactorSetup(session: SessionPayload): Promise<{
        secret: string;
        otpauthUri: string;
    }>;
    enableTwoFactor(session: SessionPayload, code: string): Promise<{
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
            preferences: CustomerPreferences;
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
    disableTwoFactor(session: SessionPayload, code: string): Promise<{
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
            preferences: CustomerPreferences;
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
    private logCustomerEvent;
}
export {};
