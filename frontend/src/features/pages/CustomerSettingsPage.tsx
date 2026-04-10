import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  Shield,
  Bell,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import {
  fetchCustomerPreferences,
  updateCustomerPreferences,
} from "@/lib/customer-dashboard";
import {
  changeCustomerPassword,
  enableCustomerTwoFactor,
  setupCustomerTwoFactor,
} from "@/lib/customer-profile";
import { pushLocalCustomerNotification } from "@/lib/customer-local-notifications";

const logoImg = "/assets/d0a94c34a139434e20f5cb9888d8909dd214b9e7.png";

export function CustomerSettingsPage() {
  const navigate = useNavigate();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [preferences, setPreferences] = useState({
    emailNotifications: false,
    smsUpdates: false,
    autoExtend: false,
  });

  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  const [isPreparing2FA, setIsPreparing2FA] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [twoFactorUri, setTwoFactorUri] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const result = await fetchCustomerPreferences();
        if (!isMounted) return;
        setPreferences(result.preferences);
      } catch {
        if (!isMounted) return;
        setPreferences({
          emailNotifications: localStorage.getItem("emailNotifications") === "true",
          smsUpdates: localStorage.getItem("smsUpdates") === "true",
          autoExtend: localStorage.getItem("autoExtend") === "true",
        });
      } finally {
        if (isMounted) setIsLoadingPreferences(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangePassword = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSavingPassword(true);
    try {
      await changeCustomerPassword(passwordData.current, passwordData.new);
      pushLocalCustomerNotification({
        type: "system",
        title: "Password changed",
        message: "Your account password was successfully updated.",
      });
      toast.success("Password changed successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
      setShowPasswordModal(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const togglePreference = async (key: keyof typeof preferences) => {
    const previous = preferences;
    const nextValue = !preferences[key];
    const optimistic = {
      ...preferences,
      [key]: nextValue,
    };
    setPreferences(optimistic);

    try {
      const result = await updateCustomerPreferences({ [key]: nextValue });
      setPreferences(result.preferences);
      localStorage.setItem("emailNotifications", String(result.preferences.emailNotifications));
      localStorage.setItem("smsUpdates", String(result.preferences.smsUpdates));
      localStorage.setItem("autoExtend", String(result.preferences.autoExtend));
      window.dispatchEvent(new Event("storage"));
      toast.success("Preference updated!");
    } catch (error) {
      setPreferences(previous);
      toast.error(error instanceof Error ? error.message : "Unable to save preference.");
    }
  };

  const handlePrepare2FA = async () => {
    setIsPreparing2FA(true);
    try {
      const result = await setupCustomerTwoFactor();
      setTwoFactorUri(result.otpauthUri);
      toast.success("2FA setup ready. Open in your authenticator app, then enter the 6-digit code.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start 2FA setup.");
    } finally {
      setIsPreparing2FA(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!twoFactorCode.trim()) {
      toast.error("Enter the 6-digit authenticator code first.");
      return;
    }

    setIsEnabling2FA(true);
    try {
      await enableCustomerTwoFactor(twoFactorCode.trim());
      pushLocalCustomerNotification({
        type: "system",
        title: "Authenticator app enabled",
        message: "Two-factor authentication is now protecting your account.",
      });
      toast.success("2FA enabled successfully!");
      setShow2FAModal(false);
      setTwoFactorUri("");
      setTwoFactorCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to enable 2FA.");
    } finally {
      setIsEnabling2FA(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F9F8] font-sans pb-12">
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 border border-[#39B5A8]/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#041614]">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Current Password", key: "current" as const },
                { label: "New Password", key: "new" as const },
                { label: "Confirm New Password", key: "confirm" as const },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-[#1A5D56] uppercase tracking-widest mb-2">{field.label}</label>
                  <div className="relative">
                    <Input
                      type={showPass[field.key] ? "text" : "password"}
                      value={passwordData[field.key]}
                      onChange={(e) => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                      className="pr-10 bg-[#F0F9F8] border-[#39B5A8]/20 focus:border-[#39B5A8] rounded-xl text-[#041614]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#39B5A8]"
                    >
                      {showPass[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="bg-[#F0F9F8] border border-[#39B5A8]/20 rounded-xl p-3">
                <p className="text-xs text-[#1A5D56]/70 font-medium flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-[#39B5A8]" />
                  Minimum 8 characters with letters, numbers, and symbols.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowPasswordModal(false)} variant="outline" className="flex-1 rounded-xl border-[#39B5A8]/20">
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={isSavingPassword} className="flex-1 bg-[#39B5A8] hover:bg-[#2D8F85] rounded-xl">
                {isSavingPassword ? "Saving..." : "Change Password"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {show2FAModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 border border-[#39B5A8]/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#041614]">Enable 2FA</h3>
              <button onClick={() => setShow2FAModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Step 1: generate your authenticator setup link. Step 2: open it in your authenticator app and enter the 6-digit code.
            </p>

            {!twoFactorUri ? (
              <Button onClick={handlePrepare2FA} disabled={isPreparing2FA} className="w-full bg-[#39B5A8] hover:bg-[#2D8F85] text-white rounded-xl mb-4">
                {isPreparing2FA ? "Preparing..." : "Generate Setup Link"}
              </Button>
            ) : (
              <div className="space-y-3 mb-4">
                <label className="block text-xs font-bold text-[#1A5D56] uppercase tracking-widest">Setup URI</label>
                <textarea
                  readOnly
                  value={twoFactorUri}
                  className="w-full h-24 p-3 text-xs rounded-xl border border-[#39B5A8]/20 bg-[#F0F9F8] text-[#041614]"
                />
                <label className="block text-xs font-bold text-[#1A5D56] uppercase tracking-widest">Authenticator Code</label>
                <Input
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456"
                  className="bg-[#F0F9F8] border-[#39B5A8]/20 focus:border-[#39B5A8] rounded-xl text-[#041614]"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => setShow2FAModal(false)} variant="outline" className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#39B5A8] hover:bg-[#2D8F85] text-white rounded-xl"
                onClick={handleEnable2FA}
                disabled={!twoFactorUri || isEnabling2FA}
              >
                {isEnabling2FA ? "Enabling..." : "Enable 2FA"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="h-20 bg-white border-b border-[#39B5A8]/10 sticky top-0 z-50 shadow-sm flex items-center justify-between px-6 md:px-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#39B5A8] font-bold text-sm hover:bg-[#39B5A8]/10 px-3 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-xl font-black text-[#041614]">Settings</h1>
        </div>

        <img src={logoImg} alt="PakiSHIP" className="h-9" />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#39B5A8]/10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-[#F0F9F8] rounded-xl">
                <Lock className="w-5 h-5 text-[#39B5A8]" />
              </div>
              <h2 className="text-2xl font-black text-[#041614]">Security</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[#F0F9F8] transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[#39B5A8]" />
                  <div>
                    <p className="font-bold text-[#1A5D56]">Change Password</p>
                    <p className="text-xs text-gray-500">Update your account password</p>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </button>

              <button
                onClick={() => setShow2FAModal(true)}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[#F0F9F8] transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#39B5A8]" />
                  <div>
                    <p className="font-bold text-[#1A5D56]">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add extra security to your account</p>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-[#39B5A8]/10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-[#F0F9F8] rounded-xl">
                <Bell className="w-5 h-5 text-[#39B5A8]" />
              </div>
              <h2 className="text-2xl font-black text-[#041614]">Notifications</h2>
            </div>

            <div className="space-y-5">
              <PreferenceToggle
                icon={<Bell className="w-5 h-5 text-[#39B5A8]" />}
                title="Email Notifications"
                description="Receive booking confirmations and updates"
                checked={preferences.emailNotifications}
                onChange={() => void togglePreference("emailNotifications")}
                disabled={isLoadingPreferences}
              />
              <PreferenceToggle
                icon={<MessageSquare className="w-5 h-5 text-[#39B5A8]" />}
                title="SMS Updates"
                description="Get real-time delivery alerts via text"
                checked={preferences.smsUpdates}
                onChange={() => void togglePreference("smsUpdates")}
                disabled={isLoadingPreferences}
              />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-[#39B5A8]/10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-[#F0F9F8] rounded-xl">
                <Clock className="w-5 h-5 text-[#39B5A8]" />
              </div>
              <h2 className="text-2xl font-black text-[#041614]">Delivery Preferences</h2>
            </div>

            <div className="space-y-5">
              <PreferenceToggle
                icon={<Clock className="w-5 h-5 text-[#39B5A8]" />}
                title="Auto-extend Delivery"
                description="Automatically extend delivery time if needed"
                checked={preferences.autoExtend}
                onChange={() => void togglePreference("autoExtend")}
                disabled={isLoadingPreferences}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PreferenceToggle({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#F0F9F8] transition-all">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 bg-[#F0F9F8] rounded-xl flex items-center justify-center shrink-0">{icon}</div>
        <div>
          <h4 className="font-bold text-[#1A5D56]">{title}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-all ${checked ? "bg-[#39B5A8]" : "bg-gray-200"} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
