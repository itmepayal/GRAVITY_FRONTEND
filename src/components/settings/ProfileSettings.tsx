import { Camera, Check, Mail, User } from "lucide-react";
import { FormField } from "@/components/form/BaseFromField";
import { BaseInput } from "@/components/form/BaseInput";
import { AccountPreferencesPanel } from "@/components/settings/AccountPreferencesPanel";
import { SettingsButton } from "@/components/settings/SettingsButton";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { useProfileSettings } from "@/hooks/settings/use-profile-settings";

export function ProfileSettings() {
  const {
    fileInputRef,
    photoPreview,
    initials,
    profileForm,
    changeProfileMutation,
    isUserLoading,
    handlePhotoChange,
    onProfileSubmit,
    onProfileInvalid,
  } = useProfileSettings();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit, onProfileInvalid)}>
        <SettingsPanel
          title="Personal information"
          description="Update your name and profile photo."
          footer={
            <SettingsButton
              type="submit"
              disabled={changeProfileMutation.isPending || isUserLoading}
              className="min-w-[128px] h-10"
            >
              {changeProfileMutation.isSuccess ? (
                <>
                  <Check size={14} />
                  Saved
                </>
              ) : changeProfileMutation.isPending ? (
                "Saving..."
              ) : (
                "Save changes"
              )}
            </SettingsButton>
          }
        >
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="h-16 w-16 rounded-xl object-cover ring-2 ring-[#8FE3C4]/25"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#8FE3C4] text-[18px] font-bold text-[#0F2D29] ring-2 ring-[#8FE3C4]/25">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#0F2D29] text-white hover:bg-[#081E1B]"
                  aria-label="Change photo"
                >
                  <Camera size={11} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#0F2D29]">
                  Profile photo
                </p>
                <p className="mt-0.5 text-[11px] text-[#8FA69E]">
                  JPG or PNG, max 2MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="name">
                <BaseInput
                  id="name"
                  icon={User}
                  type="text"
                  placeholder="Your name"
                  {...profileForm.register("name")}
                />
              </FormField>
              <FormField label="Email address" htmlFor="email">
                <BaseInput
                  id="email"
                  icon={Mail}
                  type="email"
                  disabled
                  className="cursor-not-allowed bg-[#0F2D29]/3 text-[#5B6E68]"
                  {...profileForm.register("email")}
                />
              </FormField>
            </div>
          </div>
        </SettingsPanel>
      </form>

      <AccountPreferencesPanel />
    </div>
  );
}
