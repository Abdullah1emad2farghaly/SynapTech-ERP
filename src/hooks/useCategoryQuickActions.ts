// src/hooks/useCategoryQuickActions.ts
//
// Small shared hook for the two bits of logic both CategoryActionMenu
// (three-dot) and CategoryContextMenu (right-click) need identically:
// Activate-with-toast and Copy ID-with-toast. Neither involves a dialog
// or page-level state, so they don't need to bubble all the way up to
// CategoriesPage the way Deactivate/Delete requests do — but writing
// them twice (once per trigger component) would violate the "no
// duplicated logic" rule for the sake of two nearly-identical functions.

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export function useCategoryQuickActions(onSetActive: (id: string, active: boolean) => Promise<void>) {
  const { t } = useTranslation();

  async function handleActivate(categoryId: string, categoryName: string) {
    try {
      await onSetActive(categoryId, true);
      toast.success(t("categories.toast.activated", { name: categoryName }));
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  }

  async function handleCopyId(categoryId: string) {
    try {
      await navigator.clipboard.writeText(categoryId);
      toast.success(t("categories.toast.idCopied"));
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  }

  return { handleActivate, handleCopyId };
}
