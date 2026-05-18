import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import {
  selectCurrentUser,
  changeOwnPassword,
} from "@/store/slices/auth-slice";
import { updateUser } from "@/store/slices/users-slice";

export function useSettingsForm() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  // Local state for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [saving, setSaving] = useState(false);

  // Pre-fill from currentUser
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
    }
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (password !== passwordRepeat) {
      toast.error("Паролі не співпадають");
      return;
    }

    setSaving(true);

    // Track if anything changed
    const toUpdate: Record<string, string> = {};
    if (name !== currentUser.name) toUpdate.name = name;

    try {
      // Update name if changed (via users-slice)
      if (toUpdate.name) {
        const result = await dispatch(
          updateUser({
            id: currentUser.id,
            data: { name },
          }),
        );
        if (updateUser.fulfilled.match(result)) {
          toast.success("Імʼя профілю оновлено");
        } else {
          toast.error(
            (result.payload as string) || "Помилка збереження профілю",
          );
          setSaving(false);
          return;
        }
      }

      // Password change via auth-slice thunk
      if (password) {
        const result = await dispatch(
          changeOwnPassword({ newPassword: password }) as any,
        );
        if (changeOwnPassword.fulfilled.match(result)) {
          toast.success("Пароль успішно змінено");
          setPassword("");
          setPasswordRepeat("");
        } else {
          toast.error(
            (result.payload as string) || "Не вдалося змінити пароль",
          );
        }
      }

      if (!toUpdate.name && !password) {
        toast.info("Немає змін для збереження");
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    passwordRepeat,
    setPasswordRepeat,
    saving,
    currentUser,
    handleSave,
  };
}
