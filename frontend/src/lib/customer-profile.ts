import { apiFetch } from "@/lib/api-client";

export type CustomerProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  city?: string;
  province?: string;
  profilePicture: string | null;
  preferences: {
    emailNotifications: boolean;
    smsUpdates: boolean;
    autoExtend: boolean;
  };
  discountIdUploaded: boolean;
  discountIdType?: string | null;
  discountIdStatus?: "not_uploaded" | "pending" | "verified" | "rejected";
  discountIdFileUrl?: string | null;
  discountIdSubmittedAt?: string | null;
  discountIdVerifiedAt?: string | null;
  twoFactorEnabled?: boolean;
  passwordUpdatedAt?: string | null;
};

export type CustomerProfileResponse = {
  profile: CustomerProfile;
  stats: {
    totalBookings: number;
    activeBookings: number;
    savedVehicles: number;
    accountCreated: string;
  };
  activity: Array<{
    id: string;
    type: string;
    title: string;
    description?: string | null;
    createdAt: string;
    timeLabel: string;
  }>;
};

export async function fetchCustomerProfile() {
  const response = await apiFetch("/api/customer/profile");
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to load customer profile.");
  }

  return result as CustomerProfileResponse;
}

export async function updateCustomerProfile(payload: Partial<CustomerProfile>) {
  const response = await apiFetch("/api/customer/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to update customer profile.");
  }

  return result as CustomerProfileResponse;
}

export async function uploadCustomerProfilePicture(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/api/customer/profile/upload-avatar", {
    method: "POST",
    body: formData,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to upload your profile photo.");
  }

  return result as { profilePicture: string };
}

export async function uploadCustomerDiscountId(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/api/customer/profile/upload-discount-id", {
    method: "POST",
    body: formData,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to upload your ID right now.");
  }

  return result as {
    discountIdUploaded: boolean;
    discountIdStatus: "pending";
    discountIdType: string;
    discountIdFileUrl: string;
    discountIdSubmittedAt: string;
  };
}

export async function changeCustomerPassword(currentPassword: string, newPassword: string) {
  const response = await apiFetch("/api/customer/profile/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to update your password.");
  }

  return result as CustomerProfileResponse;
}

export async function setupCustomerTwoFactor() {
  const response = await apiFetch("/api/customer/profile/two-factor/setup", {
    method: "POST",
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to start two-factor setup.");
  }

  return result as { secret: string; otpauthUri: string };
}

export async function enableCustomerTwoFactor(code: string) {
  const response = await apiFetch("/api/customer/profile/two-factor/enable", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to enable two-factor authentication.");
  }

  return result as CustomerProfileResponse;
}

export async function disableCustomerTwoFactor(code: string) {
  const response = await apiFetch("/api/customer/profile/two-factor/disable", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to disable two-factor authentication.");
  }

  return result as CustomerProfileResponse;
}

export function syncCustomerProfileToStorage(profile: CustomerProfile) {
  localStorage.setItem("userName", profile.fullName);
  localStorage.setItem("userEmail", profile.email);
  localStorage.setItem("userPhone", profile.phone);
  localStorage.setItem("userAddress", profile.address);
  localStorage.setItem("userDOB", profile.dob || "");
  localStorage.setItem("customerProfilePicture", profile.profilePicture || "");
  localStorage.setItem(
    "emailNotifications",
    String(profile.preferences.emailNotifications),
  );
  localStorage.setItem("smsUpdates", String(profile.preferences.smsUpdates));
  localStorage.setItem("autoExtend", String(profile.preferences.autoExtend));
  localStorage.setItem(
    "discountIdUploaded",
    String(profile.discountIdUploaded),
  );
  localStorage.setItem(
    "twoFactorEnabled",
    String(Boolean(profile.twoFactorEnabled)),
  );
  localStorage.setItem(
    "passwordUpdatedAt",
    profile.passwordUpdatedAt || "",
  );
  window.dispatchEvent(new Event("storage"));
}
