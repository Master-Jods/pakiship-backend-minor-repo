import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { SessionPayload } from "../common/session/session.types";
import { CustomerNotificationsService } from "../customer-notifications/customer-notifications.service";
import { SupabaseService } from "../supabase/supabase.service";
import {
  buildOtpAuthUri,
  generateTwoFactorSecret,
  verifyTotpToken,
} from "../auth/two-factor.util";

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

const PROFILE_IMAGE_BUCKET = process.env.SUPABASE_PROFILE_BUCKET || "customer-profile-images";
const DISCOUNT_ID_BUCKET = process.env.SUPABASE_DISCOUNT_BUCKET || "customer-discount-ids";
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_DISCOUNT_ID_SIZE_BYTES = 8 * 1024 * 1024;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

function readPreferences(raw: unknown): CustomerPreferences {
  const value = (raw ?? {}) as Partial<CustomerPreferences>;
  return {
    emailNotifications: Boolean(value.emailNotifications),
    smsUpdates: Boolean(value.smsUpdates),
    autoExtend: Boolean(value.autoExtend),
  };
}

function formatCreatedAtLabel(createdAt?: string | null) {
  if (!createdAt) return "Unknown";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRelativeTime(value?: string | null) {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  if (diffMs < day) {
    const hours = Math.max(1, Math.floor(diffMs / hour));
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.max(1, Math.floor(diffMs / day));
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function assertAllowedFile(
  file: UploadedFile | undefined,
  options: {
    maxSizeBytes: number;
    allowedTypes: string[];
    emptyMessage: string;
  },
): asserts file is UploadedFile {
  if (!file) {
    throw new BadRequestException(options.emptyMessage);
  }

  if (!options.allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException("Unsupported file type.");
  }

  if (file.size > options.maxSizeBytes) {
    throw new BadRequestException("File is too large.");
  }
}

function getFileExtension(filename: string) {
  const clean = filename.split(".").pop()?.toLowerCase();
  return clean?.replace(/[^a-z0-9]/g, "") || "bin";
}

@Injectable()
export class CustomerProfileService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly customerNotificationsService: CustomerNotificationsService,
  ) {}

  async getCustomerProfile(session: SessionPayload) {
    if (session.role !== "customer") {
      throw new ForbiddenException("Only customers can access this profile.");
    }

    const admin = this.supabaseService.createAdminClient();

    const [
      { data: profile, error: profileError },
      authUserResponse,
      submittedDraftsResponse,
      activityLogsResponse,
    ] = await Promise.all([
      admin
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          phone,
          dob,
          address,
          city,
          province,
          profile_picture,
          discount_id_uploaded,
          discount_id_type,
          discount_id_status,
          discount_id_file_url,
          discount_id_submitted_at,
          discount_id_verified_at,
          two_factor_enabled,
          password_updated_at,
          created_at
        `)
        .eq("id", session.userId)
        .single(),
      admin.auth.admin.getUserById(session.userId),
      admin
        .from("parcel_drafts")
        .select("id", { count: "exact" })
        .eq("user_id", session.userId)
        .eq("status", "submitted"),
      admin
        .from("customer_activity_logs")
        .select("id, activity_type, title, description, created_at")
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (profileError || !profile) {
      throw new NotFoundException("Customer profile not found.");
    }

    const authUser = authUserResponse.data.user;
    const metadata = authUser?.user_metadata ?? {};
    const preferences = readPreferences(metadata.preferences);
    const activities = (activityLogsResponse.data ?? []).map((item) => ({
      id: item.id,
      type: item.activity_type,
      title: item.title,
      description: item.description,
      createdAt: item.created_at,
      timeLabel: formatRelativeTime(item.created_at),
    }));

    return {
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        phone: `0${profile.phone}`,
        address: profile.address,
        dob: profile.dob,
        city: profile.city,
        province: profile.province,
        profilePicture: profile.profile_picture,
        preferences,
        discountIdUploaded: Boolean(profile.discount_id_uploaded),
        discountIdType: profile.discount_id_type,
        discountIdStatus: profile.discount_id_status,
        discountIdFileUrl: profile.discount_id_file_url,
        discountIdSubmittedAt: profile.discount_id_submitted_at,
        discountIdVerifiedAt: profile.discount_id_verified_at,
        twoFactorEnabled: Boolean(profile.two_factor_enabled),
        passwordUpdatedAt: profile.password_updated_at,
      },
      stats: {
        totalBookings: submittedDraftsResponse.count ?? 0,
        activeBookings: submittedDraftsResponse.count ?? 0,
        savedVehicles: 0,
        accountCreated: formatCreatedAtLabel(profile.created_at),
      },
      activity: activities,
    };
  }

  async updateCustomerProfile(session: SessionPayload, input: UpdateCustomerProfileInput) {
    if (session.role !== "customer") {
      throw new ForbiddenException("Only customers can update this profile.");
    }

    const admin = this.supabaseService.createAdminClient();
    const current = await this.getCustomerProfile(session);
    const authUserResponse = await admin.auth.admin.getUserById(session.userId);
    const currentMetadata = authUserResponse.data.user?.user_metadata ?? {};

    const fullName = (input.fullName ?? current.profile.fullName).trim();
    const email = normalizeEmail(input.email ?? current.profile.email);
    const phone = normalizePhone(input.phone ?? current.profile.phone);
    const address = (input.address ?? current.profile.address ?? "").trim();
    const dob = String(input.dob ?? current.profile.dob ?? "").trim();
    const preferences = {
      ...current.profile.preferences,
      ...(input.preferences ?? {}),
    };

    if (!fullName || !email || phone.length !== 10 || !address) {
      throw new BadRequestException("Full name, email, phone, and address are required.");
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        full_name: fullName,
        email,
        phone,
        address,
        dob: dob || null,
      })
      .eq("id", session.userId);

    if (profileError) {
      throw new InternalServerErrorException("Unable to update customer profile.");
    }

    const authUpdate = await admin.auth.admin.updateUserById(session.userId, {
      email,
      user_metadata: {
        ...currentMetadata,
        full_name: fullName,
        preferences,
        discount_id_uploaded: current.profile.discountIdUploaded,
      },
    });

    if (authUpdate.error) {
      throw new InternalServerErrorException("Profile updated but auth metadata could not be saved.");
    }

    const activityTitle = "Profile details updated";
    const activityDescription = "Your customer profile information was refreshed.";

    await admin.from("customer_activity_logs").insert({
      user_id: session.userId,
      activity_type: "profile",
      title: activityTitle,
      description: activityDescription,
    });

    await this.customerNotificationsService.createNotification(
      session.userId,
      "system",
      activityTitle,
      activityDescription,
    );

    return this.getCustomerProfile({
      ...session,
      fullName,
    });
  }

  async uploadProfilePicture(session: SessionPayload, file: UploadedFile | undefined) {
    if (session.role !== "customer") {
      throw new ForbiddenException("Only customers can update this profile.");
    }

    assertAllowedFile(file, {
      maxSizeBytes: MAX_AVATAR_SIZE_BYTES,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      emptyMessage: "Please choose an image to upload.",
    });

    const admin = this.supabaseService.createAdminClient();
    const extension = getFileExtension(file.originalname);
    const objectPath = `${session.userId}/avatar-${randomUUID()}.${extension}`;
    const uploadResult = await admin.storage.from(PROFILE_IMAGE_BUCKET).upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    if (uploadResult.error) {
      throw new InternalServerErrorException("Unable to upload your profile image.");
    }

    const { data: publicUrlData } = admin.storage
      .from(PROFILE_IMAGE_BUCKET)
      .getPublicUrl(objectPath);
    const profilePicture = publicUrlData.publicUrl;

    const { error } = await admin
      .from("profiles")
      .update({ profile_picture: profilePicture })
      .eq("id", session.userId);

    if (error) {
      throw new InternalServerErrorException("Profile picture uploaded but could not be saved.");
    }

    await this.logCustomerEvent(
      session.userId,
      "profile",
      "Profile photo updated",
      "Your new profile photo is now visible in the app.",
      "system",
    );

    return {
      profilePicture,
    };
  }

  async uploadDiscountId(session: SessionPayload, file: UploadedFile | undefined) {
    if (session.role !== "customer") {
      throw new ForbiddenException("Only customers can update this profile.");
    }

    assertAllowedFile(file, {
      maxSizeBytes: MAX_DISCOUNT_ID_SIZE_BYTES,
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
      emptyMessage: "Please choose a discount ID to upload.",
    });

    const admin = this.supabaseService.createAdminClient();
    const extension = getFileExtension(file.originalname);
    const objectPath = `${session.userId}/discount-id-${randomUUID()}.${extension}`;
    const uploadResult = await admin.storage.from(DISCOUNT_ID_BUCKET).upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    if (uploadResult.error) {
      throw new InternalServerErrorException("Unable to upload your discount ID.");
    }

    const { data: publicUrlData } = admin.storage
      .from(DISCOUNT_ID_BUCKET)
      .getPublicUrl(objectPath);
    const discountIdFileUrl = publicUrlData.publicUrl;
    const submittedAt = new Date().toISOString();

    const { error } = await admin
      .from("profiles")
      .update({
        discount_id_uploaded: true,
        discount_id_type: "pwd_or_senior",
        discount_id_status: "pending",
        discount_id_file_url: discountIdFileUrl,
        discount_id_submitted_at: submittedAt,
        discount_id_verified_at: null,
      })
      .eq("id", session.userId);

    if (error) {
      throw new InternalServerErrorException("Discount ID uploaded but could not be saved.");
    }

    await this.logCustomerEvent(
      session.userId,
      "verification",
      "Discount ID submitted",
      "Your PWD or Senior Citizen ID was uploaded and is now pending review.",
      "system",
    );

    return {
      discountIdUploaded: true,
      discountIdStatus: "pending" as const,
      discountIdType: "pwd_or_senior",
      discountIdFileUrl,
      discountIdSubmittedAt: submittedAt,
    };
  }

  async changePassword(
    session: SessionPayload,
    currentPassword: string,
    newPassword: string,
  ) {
    if (session.role !== "customer") {
      throw new ForbiddenException("Only customers can update this profile.");
    }

    if (!currentPassword || !newPassword) {
      throw new BadRequestException("Current and new passwords are required.");
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      throw new BadRequestException(
        "New password must be at least 8 characters and include a number and special character.",
      );
    }

    const admin = this.supabaseService.createAdminClient();
    const supabase = this.supabaseService.createServerClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("email")
      .eq("id", session.userId)
      .single();

    if (profileError || !profile?.email) {
      throw new NotFoundException("Customer profile not found.");
    }

    const signInResult = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });

    if (signInResult.error || !signInResult.data.user) {
      throw new UnauthorizedException("Current password is incorrect.");
    }

    const passwordUpdatedAt = new Date().toISOString();
    const updateAuthResult = await admin.auth.admin.updateUserById(session.userId, {
      password: newPassword,
    });

    if (updateAuthResult.error) {
      throw new InternalServerErrorException("Unable to update your password right now.");
    }

    const { error } = await admin
      .from("profiles")
      .update({ password_updated_at: passwordUpdatedAt })
      .eq("id", session.userId);

    if (error) {
      throw new InternalServerErrorException("Password updated but profile security details could not be saved.");
    }

    await this.logCustomerEvent(
      session.userId,
      "security",
      "Password changed",
      "Your account password was successfully updated.",
      "system",
    );

    return this.getCustomerProfile(session);
  }

  async createTwoFactorSetup(session: SessionPayload) {
    if (session.role !== "customer") {
      throw new ForbiddenException("Only customers can update this profile.");
    }

    const admin = this.supabaseService.createAdminClient();
    const profileResponse = await admin
      .from("profiles")
      .select("email, two_factor_enabled")
      .eq("id", session.userId)
      .single();
    const authUserResponse = await admin.auth.admin.getUserById(session.userId);
    const currentMetadata = authUserResponse.data.user?.user_metadata ?? {};

    if (profileResponse.error || !profileResponse.data) {
      throw new NotFoundException("Customer profile not found.");
    }

    if (profileResponse.data.two_factor_enabled) {
      throw new BadRequestException("Two-factor authentication is already enabled.");
    }

    const secret = generateTwoFactorSecret();
    const authUpdate = await admin.auth.admin.updateUserById(session.userId, {
      user_metadata: {
        ...currentMetadata,
        two_factor_pending_secret: secret,
      },
    });

    if (authUpdate.error) {
      throw new InternalServerErrorException("Unable to prepare two-factor authentication.");
    }

    return {
      secret,
      otpauthUri: buildOtpAuthUri(secret, profileResponse.data.email),
    };
  }

  async enableTwoFactor(session: SessionPayload, code: string) {
    if (session.role !== "customer") {
      throw new ForbiddenException("Only customers can update this profile.");
    }

    const admin = this.supabaseService.createAdminClient();
    const userResponse = await admin.auth.admin.getUserById(session.userId);
    const user = userResponse.data.user;
    const metadata = user?.user_metadata ?? {};
    const pendingSecret = metadata.two_factor_pending_secret;

    if (typeof pendingSecret !== "string" || pendingSecret.length === 0) {
      throw new BadRequestException("Start the two-factor setup first.");
    }

    if (!verifyTotpToken(pendingSecret, code)) {
      throw new UnauthorizedException("Invalid authenticator code.");
    }

    const authUpdate = await admin.auth.admin.updateUserById(session.userId, {
      user_metadata: {
        ...metadata,
        two_factor_secret: pendingSecret,
        two_factor_pending_secret: null,
      },
    });

    if (authUpdate.error) {
      throw new InternalServerErrorException("Unable to enable two-factor authentication.");
    }

    const { error } = await admin
      .from("profiles")
      .update({ two_factor_enabled: true })
      .eq("id", session.userId);

    if (error) {
      throw new InternalServerErrorException("Two-factor authentication enabled but profile could not be updated.");
    }

    await this.logCustomerEvent(
      session.userId,
      "security",
      "Authenticator app enabled",
      "Two-factor authentication is now protecting your account.",
      "system",
    );

    return this.getCustomerProfile(session);
  }

  async disableTwoFactor(session: SessionPayload, code: string) {
    if (session.role !== "customer") {
      throw new ForbiddenException("Only customers can update this profile.");
    }

    const admin = this.supabaseService.createAdminClient();
    const userResponse = await admin.auth.admin.getUserById(session.userId);
    const metadata = userResponse.data.user?.user_metadata ?? {};
    const secret = metadata.two_factor_secret;

    if (typeof secret !== "string" || secret.length === 0) {
      throw new BadRequestException("Two-factor authentication is not enabled.");
    }

    if (!verifyTotpToken(secret, code)) {
      throw new UnauthorizedException("Invalid authenticator code.");
    }

    const authUpdate = await admin.auth.admin.updateUserById(session.userId, {
      user_metadata: {
        ...metadata,
        two_factor_secret: null,
        two_factor_pending_secret: null,
      },
    });

    if (authUpdate.error) {
      throw new InternalServerErrorException("Unable to disable two-factor authentication.");
    }

    const { error } = await admin
      .from("profiles")
      .update({ two_factor_enabled: false })
      .eq("id", session.userId);

    if (error) {
      throw new InternalServerErrorException("Two-factor authentication disabled but profile could not be updated.");
    }

    await this.logCustomerEvent(
      session.userId,
      "security",
      "Authenticator app removed",
      "Two-factor authentication was turned off for your account.",
      "system",
    );

    return this.getCustomerProfile(session);
  }

  private async logCustomerEvent(
    userId: string,
    activityType: string,
    title: string,
    description: string,
    notificationType: "delivery" | "system" | "promo" = "system",
  ) {
    const admin = this.supabaseService.createAdminClient();
    await admin.from("customer_activity_logs").insert({
      user_id: userId,
      activity_type: activityType,
      title,
      description,
    });

    await this.customerNotificationsService.createNotification(
      userId,
      notificationType,
      title,
      description,
    );
  }
}
