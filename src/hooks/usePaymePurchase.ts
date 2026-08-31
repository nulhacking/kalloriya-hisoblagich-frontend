import { useState } from "react";
import { useIsTelegramMiniApp } from "../stores";
import { useCreatePaymePayLink, useSubscriptionStatus } from "./useFoodAnalysis";
import { buildPaymeGetUrlFromStatus, openPaymeUrl } from "../utils/payme";

/**
 * Payme to'lovini ochish — Pro va Pro Plus uchun bir xil yo'l.
 *
 * Avval /status javobidan GET-link quriladi (tarmoq so'rovisiz), bo'lmasa
 * backend /pay-link ishlatiladi. Ilgari bu mantiq SubscriptionFab ichida
 * takrorlangan edi; endi hamma tarif tugmasi shu hookdan foydalanadi.
 */
export const usePaymePurchase = () => {
  const isTelegramMiniApp = useIsTelegramMiniApp();
  const subscriptionQuery = useSubscriptionStatus();
  const payLinkMutation = useCreatePaymePayLink();
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);

  const subscription = subscriptionQuery.data;

  const pay = async (amount: number): Promise<boolean> => {
    if (!subscription || pendingAmount !== null || amount <= 0) return false;
    setPendingAmount(amount);
    try {
      const localUrl = buildPaymeGetUrlFromStatus(subscription, amount);
      if (localUrl) {
        openPaymeUrl(localUrl, isTelegramMiniApp);
        return true;
      }

      const response = await payLinkMutation.mutateAsync(amount);
      const tgOpen = response.telegram_open_url?.trim();

      // Eski POST-flow (zaxira): kabinet GET-link bermasa forma yuboriladi.
      if (
        response.pay_method === "post" &&
        response.pay_form_fields &&
        Object.keys(response.pay_form_fields).length > 0
      ) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = response.pay_url;
        form.target = "_blank";
        form.acceptCharset = "UTF-8";
        for (const [name, value] of Object.entries(response.pay_form_fields)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        form.remove();
        return true;
      }

      openPaymeUrl(
        isTelegramMiniApp && tgOpen ? tgOpen : response.pay_url,
        isTelegramMiniApp,
      );
      return true;
    } finally {
      setPendingAmount(null);
    }
  };

  return {
    subscription,
    pay,
    /** Shu summa bo'yicha to'lov ochilmoqda. */
    isPending: (amount: number) => pendingAmount === amount,
    busy: pendingAmount !== null,
  };
};
