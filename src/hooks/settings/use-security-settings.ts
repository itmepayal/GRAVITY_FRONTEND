import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";
import {
  passwordSchema,
  type PasswordFormData,
} from "@/validations/user.validation";
import {
  useChangePassword,
  useDeactivateAccount,
  useDeleteAccount,
  useDisableTwoFA,
  useEnableTwoFA,
  useLinkGoogleAccount,
  useLogout,
  useReactivateAccount,
  useRevokeOtherSessions,
  useRevokeSession,
} from "@/hooks/mutations/settings";
import { useCurrentUser, useGetSessions } from "@/hooks/queries/settings";

type AccountAction = "deactivate" | "delete";

export function useSecuritySettings() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: sessions = [], isLoading: isSessionsLoading } =
    useGetSessions();

  const changePasswordMutation = useChangePassword();
  const logoutMutation = useLogout();
  const enableTwoFAMutation = useEnableTwoFA();
  const disableTwoFAMutation = useDisableTwoFA();
  const linkGoogleMutation = useLinkGoogleAccount();
  const deactivateAccountMutation = useDeactivateAccount();
  const deleteAccountMutation = useDeleteAccount();
  const reactivateAccountMutation = useReactivateAccount();
  const revokeSessionMutation = useRevokeSession();
  const revokeOtherSessionsMutation = useRevokeOtherSessions();

  const [show2FAPasswordForm, setShow2FAPasswordForm] = useState(false);
  const [twoFAPassword, setTwoFAPassword] = useState("");
  const [showGoogleLinkOverlay, setShowGoogleLinkOverlay] = useState(false);
  const [showGoogleActionOverlay, setShowGoogleActionOverlay] = useState(false);
  const [pendingAccountAction, setPendingAccountAction] =
    useState<AccountAction | null>(null);
  const [accountActionPassword, setAccountActionPassword] = useState("");
  const [showDeactivateForm, setShowDeactivateForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [reactivateEmail, setReactivateEmail] = useState("");
  const [reactivatePassword, setReactivatePassword] = useState("");

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const is2FAEnabled = user?.is2FAEnabled ?? false;
  const is2FAPending =
    enableTwoFAMutation.isPending || disableTwoFAMutation.isPending;
  const isLocalAccount = user?.authProvider !== "google";
  const isGoogleAccount = user?.authProvider === "google";
  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  const reset2FAForm = () => {
    setShow2FAPasswordForm(false);
    setTwoFAPassword("");
  };

  const handleToggle2FA = () => {
    if (is2FAPending) return;
    if (isLocalAccount) {
      setShow2FAPasswordForm(true);
      return;
    }
    if (is2FAEnabled) {
      disableTwoFAMutation.mutate(undefined, { onSuccess: reset2FAForm });
    } else {
      enableTwoFAMutation.mutate(undefined, { onSuccess: reset2FAForm });
    }
  };

  const handleConfirm2FA = () => {
    if (!twoFAPassword.trim()) {
      toast.error("Please enter your password to continue.");
      return;
    }
    const onComplete = { onSuccess: reset2FAForm };
    if (is2FAEnabled) {
      disableTwoFAMutation.mutate(twoFAPassword, onComplete);
    } else {
      enableTwoFAMutation.mutate(twoFAPassword, onComplete);
    }
  };

  const handleGoogleLinkSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error("Google sign-in failed. Please try again.");
      setShowGoogleLinkOverlay(false);
      return;
    }
    linkGoogleMutation.mutate(response.credential, {
      onSettled: () => setShowGoogleLinkOverlay(false),
    });
  };

  const handleGoogleActionSuccess = (response: CredentialResponse) => {
    if (!response.credential || !pendingAccountAction) {
      toast.error("Google verification failed. Please try again.");
      setShowGoogleActionOverlay(false);
      setPendingAccountAction(null);
      return;
    }
    const payload = { idToken: response.credential };
    const onSettled = () => {
      setShowGoogleActionOverlay(false);
      setPendingAccountAction(null);
    };
    if (pendingAccountAction === "deactivate") {
      deactivateAccountMutation.mutate(payload, { onSettled });
      return;
    }
    deleteAccountMutation.mutate(payload, { onSettled });
  };

  const handleConfirmDeactivate = () => {
    if (!accountActionPassword.trim()) {
      toast.error("Please enter your password to deactivate your account.");
      return;
    }
    deactivateAccountMutation.mutate(
      { password: accountActionPassword },
      {
        onSuccess: () => {
          setShowDeactivateForm(false);
          setAccountActionPassword("");
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!accountActionPassword.trim()) {
      toast.error("Please enter your password to delete your account.");
      return;
    }
    deleteAccountMutation.mutate(
      { password: accountActionPassword },
      {
        onSuccess: () => {
          setShowDeleteForm(false);
          setAccountActionPassword("");
        },
      },
    );
  };

  const handleReactivate = () => {
    if (!reactivateEmail.trim() || !reactivatePassword.trim()) {
      toast.error("Email and password are required.");
      return;
    }
    reactivateAccountMutation.mutate({
      email: reactivateEmail.trim(),
      password: reactivatePassword,
    });
  };

  const onPasswordSubmit = (values: PasswordFormData) => {
    changePasswordMutation.mutate(values, {
      onSuccess: () => passwordForm.reset(),
    });
  };

  return {
    user,
    sessions,
    isUserLoading,
    isSessionsLoading,
    is2FAEnabled,
    is2FAPending,
    isLocalAccount,
    isGoogleAccount,
    otherSessionsCount,
    show2FAPasswordForm,
    twoFAPassword,
    setTwoFAPassword,
    showGoogleLinkOverlay,
    setShowGoogleLinkOverlay,
    showGoogleActionOverlay,
    pendingAccountAction,
    setPendingAccountAction,
    setShowGoogleActionOverlay,
    accountActionPassword,
    setAccountActionPassword,
    showDeactivateForm,
    setShowDeactivateForm,
    showDeleteForm,
    setShowDeleteForm,
    reactivateEmail,
    setReactivateEmail,
    reactivatePassword,
    setReactivatePassword,
    passwordForm,
    changePasswordMutation,
    logoutMutation,
    deactivateAccountMutation,
    deleteAccountMutation,
    reactivateAccountMutation,
    revokeSessionMutation,
    revokeOtherSessionsMutation,
    handleToggle2FA,
    handleConfirm2FA,
    reset2FAForm,
    handleGoogleLinkSuccess,
    handleGoogleActionSuccess,
    handleConfirmDeactivate,
    handleConfirmDelete,
    handleReactivate,
    onPasswordSubmit,
  };
}
