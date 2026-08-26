import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  profileSchema,
  type ProfileFormData,
} from "@/validations/user.validation";
import { useChangeProfile } from "@/hooks/mutations/settings";
import { useCurrentUser } from "@/hooks/queries/settings";
import {
  getInitials,
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_TYPES,
} from "@/components/settings/settings.utils";

export function useProfileSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const changeProfileMutation = useChangeProfile();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({ name: user.name ?? "", email: user.email ?? "" });
    if (user.avatar) setPhotoPreview(user.avatar);
  }, [user, profileForm]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!PROFILE_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please select a JPG or PNG image.");
      event.target.value = "";
      return;
    }

    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      toast.error("Image must be under 2MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(file);
    setPhotoFile(file);
    event.target.value = "";
  };

  const onProfileSubmit = (values: ProfileFormData) => {
    changeProfileMutation.mutate({
      name: values.name,
      avatar: photoFile ?? null,
    });
  };

  const onProfileInvalid = () => {
    const firstError = Object.values(profileForm.formState.errors)[0];
    if (firstError?.message) toast.error(firstError.message as string);
  };

  return {
    user,
    isUserLoading,
    fileInputRef,
    photoPreview,
    initials: getInitials(user?.name),
    profileForm,
    changeProfileMutation,
    handlePhotoChange,
    onProfileSubmit,
    onProfileInvalid,
  };
}
