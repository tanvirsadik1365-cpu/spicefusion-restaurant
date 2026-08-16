"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  BadgePercent,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  KeyRound,
  LogIn,
  Lock,
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  Truck,
  User,
  UserRoundCheck,
} from "lucide-react";
import { GoogleMark } from "@/components/GoogleMark";
import { useCart } from "@/components/CartProvider";
import {
  COLLECTION_MINIMUM,
  DELIVERY_MINIMUM,
  formatCurrency,
  formatPostcode,
  getActiveReward,
  getCollectionDiscount,
  getDeliveryFee,
  getOrderTotal,
  getSideDishOptions,
  getSubtotal,
  isValidDeliveryPostcode,
  isValidGbPhone,
  type CustomerMode,
} from "@/lib/order";
import { restaurant } from "@/lib/restaurant";
import { StoreStatusNotice } from "@/components/StoreStatusNotice";
import { useStoreStatus } from "@/components/useStoreStatus";
import {
  LAST_ORDER_TRACKING_KEY,
  getItemsValue,
  saveOrderAnalyticsSnapshot,
  toEcommerceItems,
  trackEcommerceEvent,
  trackEvent,
  trackMetaEvent,
} from "@/lib/analytics";
import {
  getSupabaseBrowser,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase-browser";

type CustomerDetails = {
  address: string;
  email: string;
  name: string;
  notes: string;
  password: string;
  phone: string;
  postcode: string;
};

type CheckoutStep = "food" | "fulfilment" | "details" | "payment";
type CheckoutAccountMode = "guest" | "sign-in";
type PaymentChoice = "online" | "cash";

const initialCustomer: CustomerDetails = {
  address: "",
  email: "",
  name: "",
  notes: "",
  password: "",
  phone: "",
  postcode: "",
};

const stepOrder: CheckoutStep[] = ["food", "fulfilment", "details", "payment"];
const checkoutCardClass =
  "checkout-step-card rounded-lg border border-white/10 bg-[#1A1A1A] p-5 text-white shadow-[0_22px_54px_rgba(0,0,0,0.28)] sm:p-6";
const checkoutEyebrowClass =
  "text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B]";
const checkoutMutedClass = "text-sm leading-7 text-white/58";
const checkoutFieldClass =
  "mt-2 w-full rounded-lg border border-white/12 bg-white/8 px-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-[#E52B2B]/65 focus:ring-4 focus:ring-[#E52B2B]/12";
const checkoutSecondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 text-sm font-black text-white transition hover:border-[#E52B2B]/55 hover:text-[#F4B400] disabled:cursor-not-allowed disabled:opacity-40";
const checkoutPrimaryButtonClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-6 text-sm font-black text-white shadow-lg shadow-[#E52B2B]/20 transition hover:bg-white hover:text-[#121212] disabled:cursor-not-allowed disabled:bg-white/18 disabled:text-white/45 disabled:shadow-none";

function getOrigin() {
  return window.location.origin;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function Price({ value }: { value: string }) {
  return (
    <>
      {value.split(" / ").map((part, index) => (
        <span key={`${part}-${index}`}>
          {index > 0 ? " / " : ""}
          &pound;{part}
        </span>
      ))}
    </>
  );
}

export function CartPageClient() {
  const {
    addItem,
    cartItems,
    clearCart,
    decreaseItem,
    itemCount,
    orderType,
    removeItem,
    setOrderType,
  } = useCart();
  const [activeStep, setActiveStep] = useState<CheckoutStep>("food");
  const [checkoutAccountMode, setCheckoutAccountMode] =
    useState<CheckoutAccountMode>("guest");
  const [customer, setCustomer] = useState<CustomerDetails>(initialCustomer);
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>("online");
  const [selectedSideDishId, setSelectedSideDishId] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutAction, setCheckoutAction] = useState<"cash" | "online" | null>(
    null,
  );
  const [accountAccessToken, setAccountAccessToken] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountNotice, setAccountNotice] = useState<{
    message: string;
    tone: "error" | "success";
  } | null>(null);
  const [accountOAuthLoading, setAccountOAuthLoading] = useState(false);
  const { orderingAllowed, storeStatus } = useStoreStatus();

  const subtotal = useMemo(() => getSubtotal(cartItems), [cartItems]);
  const reward = getActiveReward(subtotal, orderType);
  const sideDishOptions = useMemo(() => getSideDishOptions(), []);
  const collectionDiscount = getCollectionDiscount(subtotal, reward);
  const deliveryFee = getDeliveryFee(orderType, subtotal);
  const total = getOrderTotal(subtotal, reward, orderType);
  const hasDishes = cartItems.length > 0;
  const phoneValid = isValidGbPhone(customer.phone);
  const emailValid = isValidEmail(customer.email);
  const customerMode: CustomerMode =
    checkoutAccountMode === "guest" ? "guest" : "signin";
  const accountPasswordRequired =
    !accountAccessToken && checkoutAccountMode !== "guest";
  const accountPasswordValid =
    !accountPasswordRequired || customer.password.trim().length >= 6;
  const contactDetailsValid =
    customer.name.trim().length > 1 &&
    emailValid &&
    phoneValid &&
    accountPasswordValid;
  const deliveryPostcodeValid =
    orderType === "collection" || isValidDeliveryPostcode(customer.postcode);
  const deliveryMinimumValid =
    orderType === "collection" || subtotal >= DELIVERY_MINIMUM;
  const fulfilmentValid =
    deliveryMinimumValid &&
    deliveryPostcodeValid &&
    (orderType === "collection" || customer.address.trim().length > 5);
  const rewardSelectionValid =
    !reward.requiresSideDish ||
    sideDishOptions.some((item) => item.id === selectedSideDishId);
  const foodStepValid = hasDishes;
  const orderReady =
    foodStepValid && rewardSelectionValid && fulfilmentValid && contactDetailsValid;
  const canCheckout = orderReady && orderingAllowed;
  const checkingOut = checkoutAction !== null;

  const checkoutSteps = [
    {
      id: "food" as const,
      label: "Order",
      title: "Check your order",
      detail: hasDishes
        ? `${itemCount} item${itemCount === 1 ? "" : "s"} in your order`
        : "Choose dishes first",
      complete: foodStepValid,
    },
    {
      id: "fulfilment" as const,
      label: "Method",
      title: "Choose collection or delivery",
      detail:
        orderType === "delivery"
          ? deliveryPostcodeValid
            ? "Delivery area confirmed"
            : "Postcode check needed"
          : "Collection from 137 Main St, Addingham",
      complete: fulfilmentValid,
    },
    {
      id: "details" as const,
      label: "Details",
      title: "Add your details",
      detail: contactDetailsValid
        ? "Customer details ready"
        : "Name, email, and phone needed",
      complete: contactDetailsValid,
    },
    {
      id: "payment" as const,
      label: "Payment",
      title: "Choose payment",
      detail: !orderingAllowed
        ? "Ordering unavailable"
        : canCheckout
          ? "Ready for payment"
          : "Finish details first",
      complete: canCheckout,
    },
  ];

  const activeStepIndex = stepOrder.indexOf(activeStep);
  const currentStep = checkoutSteps.find((step) => step.id === activeStep);

  useEffect(() => {
    if (!hasDishes && activeStep !== "food") {
      setActiveStep("food");
    }
  }, [activeStep, hasDishes]);

  useEffect(() => {
    if (!hasDishes) {
      return;
    }

    trackEcommerceEvent("view_cart", {
      currency: "GBP",
      items: toEcommerceItems(cartItems),
      value: getItemsValue(cartItems),
    });
  }, [cartItems, hasDishes]);

  useEffect(() => {
    if (!hasDishes) {
      return;
    }

    trackEvent("checkout_step_view", {
      checkout_step: activeStep,
      order_type: orderType,
      value: total,
      currency: "GBP",
      items_count: itemCount,
    });
  }, [activeStep, hasDishes, itemCount, orderType, total]);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      return;
    }

    let mounted = true;
    const supabase = getSupabaseBrowser();

    function applySession(session: Session | null) {
      if (!mounted) {
        return;
      }

      setAccountAccessToken(session?.access_token ?? "");
      setAccountEmail(session?.user.email ?? "");

      if (session?.user.email) {
        const metadata = session.user.user_metadata;
        const profileName =
          typeof metadata.full_name === "string"
            ? metadata.full_name
            : typeof metadata.name === "string"
              ? metadata.name
              : "";
        const profilePhone =
          typeof metadata.phone === "string" ? metadata.phone : "";

        setCheckoutAccountMode("sign-in");
        setCustomer((current) => ({
          ...current,
          email: current.email || session.user.email || "",
          name: current.name || profileName,
          phone: current.phone || profilePhone,
        }));
      }
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!reward.requiresSideDish) {
      setSelectedSideDishId("");
    }
  }, [reward.requiresSideDish]);

  function updateCustomer(field: keyof CustomerDetails, value: string) {
    setAccountNotice(null);
    setCustomer((current) => ({
      ...current,
      [field]: field === "postcode" ? formatPostcode(value) : value,
    }));
  }

  function getOrderRequestBody() {
    return {
      customer: {
        address: customer.address,
        email: customer.email,
        name: customer.name,
        notes: customer.notes,
        phone: customer.phone,
        postcode: customer.postcode,
      },
      customerMode,
      items: cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
      orderType,
      selectedSideDishId,
      website: "",
    };
  }

  function getCheckoutHeaders(accessToken = accountAccessToken) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
  }

  function saveCustomerProfileLocal() {
    if (customerMode !== "signin") {
      return;
    }

    window.localStorage.setItem(
      "Spice Fusion TAKEAWAY-customer-profile-v1",
      JSON.stringify({
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
      }),
    );
  }

  async function saveCustomerAccountProfile(accessToken: string) {
    const response = await fetch("/api/account/profile", {
      body: JSON.stringify({
        name: customer.name,
        phone: customer.phone,
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      throw new Error(payload.error ?? "Customer details could not be saved.");
    }
  }

  async function prepareCheckoutAccount() {
    if (checkoutAccountMode === "guest") {
      return accountAccessToken;
    }

    if (!isSupabaseBrowserConfigured()) {
      throw new Error("Customer accounts are not configured yet.");
    }

    if (accountAccessToken) {
      await saveCustomerAccountProfile(accountAccessToken);
      return accountAccessToken;
    }

    const supabase = getSupabaseBrowser();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: customer.email,
      password: customer.password,
    });

    if (error) {
      throw error;
    }

    const accessToken = data.session?.access_token;

    if (!accessToken) {
      throw new Error("Sign in could not be completed. Try again.");
    }

    setAccountAccessToken(accessToken);
    setAccountEmail(data.user?.email ?? customer.email);
    await saveCustomerAccountProfile(accessToken);

    return accessToken;
  }

  async function startGoogleCheckoutSignIn() {
    setAccountNotice(null);

    if (!isSupabaseBrowserConfigured()) {
      setAccountNotice({
        message: "Customer accounts are not configured yet.",
        tone: "error",
      });
      return;
    }

    setCheckoutAccountMode("sign-in");
    setAccountOAuthLoading(true);

    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOAuth({
        options: {
          redirectTo: `${getOrigin()}/cart`,
        },
        provider: "google",
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setAccountOAuthLoading(false);
      setAccountNotice({
        message:
          error instanceof Error ? error.message : "Google sign in failed.",
        tone: "error",
      });
    }
  }

  function saveLastOrderTracking(orderNumber: string) {
    const contact = customer.email.trim() || customer.phone.trim();

    if (!orderNumber.trim() || !contact) {
      return;
    }

    window.localStorage.setItem(
      LAST_ORDER_TRACKING_KEY,
      JSON.stringify({
        contact,
        orderNumber,
        savedAt: new Date().toISOString(),
      }),
    );
  }

  function saveCheckoutAnalyticsSnapshot(orderNumber: string, paymentMethod: PaymentChoice) {
    saveOrderAnalyticsSnapshot({
      currency: "GBP",
      item_count: itemCount,
      items: toEcommerceItems(cartItems),
      order_id: orderNumber,
      order_type: orderType,
      payment_method: paymentMethod,
      shipping: deliveryFee,
      tax: 0,
      value: total,
    });
  }

  function isStepUnlocked(stepId: CheckoutStep) {
    const index = stepOrder.indexOf(stepId);

    if (index <= activeStepIndex) {
      return true;
    }

    return stepOrder.slice(0, index).every((id) => {
      const step = checkoutSteps.find((item) => item.id === id);
      return step?.complete;
    });
  }

  function goToStep(stepId: CheckoutStep) {
    if (isStepUnlocked(stepId)) {
      setActiveStep(stepId);
      setCheckoutError("");
    }
  }

  function goNext() {
    const nextStep = stepOrder[activeStepIndex + 1];

    if (nextStep && isStepUnlocked(nextStep)) {
      setActiveStep(nextStep);
      setCheckoutError("");
    }
  }

  function goBack() {
    const previousStep = stepOrder[activeStepIndex - 1];

    if (previousStep) {
      setActiveStep(previousStep);
      setCheckoutError("");
    }
  }

  async function startOnlineCheckout() {
    if (!canCheckout || checkingOut) {
      return;
    }

    setCheckoutAction("online");
    setCheckoutError("");
    trackEvent("begin_checkout", {
      checkout_method: "online",
      order_type: orderType,
      currency: "GBP",
      value: total,
      items_count: itemCount,
    });
    trackEcommerceEvent("add_payment_info", {
      currency: "GBP",
      items: toEcommerceItems(cartItems),
      payment_type: "online",
      value: total,
    });
    trackMetaEvent("InitiateCheckout", {
      currency: "GBP",
      value: total,
      num_items: itemCount,
    });

    try {
      const accessToken = await prepareCheckoutAccount();
      const response = await fetch("/api/checkout", {
        body: JSON.stringify(getOrderRequestBody()),
        headers: getCheckoutHeaders(accessToken),
        method: "POST",
      });

      const payload = (await response.json()) as {
        error?: string;
        orderId?: string;
        url?: string;
      };

      if (!response.ok || !payload.url || !payload.orderId) {
        throw new Error(payload.error ?? "Payment could not be started.");
      }

      saveCustomerProfileLocal();
      saveLastOrderTracking(payload.orderId);
      saveCheckoutAnalyticsSnapshot(payload.orderId, "online");
      window.location.href = payload.url;
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Payment could not be started.",
      );
      setCheckoutAction(null);
    }
  }

  async function placeCashOrder() {
    if (!canCheckout || checkingOut) {
      return;
    }

    setCheckoutAction("cash");
    setCheckoutError("");
    trackEvent("begin_checkout", {
      checkout_method: "cash",
      order_type: orderType,
      currency: "GBP",
      value: total,
      items_count: itemCount,
    });
    trackEcommerceEvent("add_payment_info", {
      currency: "GBP",
      items: toEcommerceItems(cartItems),
      payment_type: "cash",
      value: total,
    });
    trackMetaEvent("InitiateCheckout", {
      currency: "GBP",
      value: total,
      num_items: itemCount,
    });

    try {
      const accessToken = await prepareCheckoutAccount();
      const response = await fetch("/api/orders/cash", {
        body: JSON.stringify(getOrderRequestBody()),
        headers: getCheckoutHeaders(accessToken),
        method: "POST",
      });

      const payload = (await response.json()) as {
        error?: string;
        orderId?: string;
      };

      if (!response.ok || !payload.orderId) {
        throw new Error(payload.error ?? "Cash order could not be placed.");
      }

      saveCustomerProfileLocal();
      saveLastOrderTracking(payload.orderId);
      saveCheckoutAnalyticsSnapshot(payload.orderId, "cash");
      clearCart();
      window.location.href = `/checkout/success?payment=cash&order_id=${encodeURIComponent(
        payload.orderId,
      )}`;
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Cash order could not be placed.",
      );
      setCheckoutAction(null);
    }
  }

  function getNextHint() {
    if (!orderingAllowed) {
      return {
        title: storeStatus?.label ?? "Ordering unavailable",
        detail:
          storeStatus?.message ??
          "Online ordering is temporarily unavailable.",
      };
    }

    if (!hasDishes) {
      return {
        title: "Start with a favourite",
        detail: "A curry, rice, and naan is an easy place to start.",
        action: "Browse menu",
        href: "/menu#popular-picks",
      };
    }

    if (orderType === "delivery" && subtotal < DELIVERY_MINIMUM) {
      return {
        title: "Almost ready for delivery",
        detail: `Add ${formatCurrency(
          DELIVERY_MINIMUM - subtotal,
        )} more to reach the delivery minimum.`,
        action: "Add dishes",
        href: "/menu",
      };
    }

    if (orderType === "collection" && subtotal > 0 && subtotal < COLLECTION_MINIMUM) {
      return {
        title: "Almost ready for collection",
        detail: `Add ${formatCurrency(
          COLLECTION_MINIMUM - subtotal,
        )} more to unlock the 15% collection discount.`,
        action: "Add dishes",
        href: "/menu",
      };
    }

    if (subtotal <= 0) {
      return {
        title: "Unlock Spice Fusion TAKEAWAY's collection offer",
        detail: `Spend ${formatCurrency(COLLECTION_MINIMUM)}+ to apply the 15% collection discount.`,
        action: "Add dishes",
        href: "/menu",
      };
    }

    if (activeStep === "details" && !contactDetailsValid) {
      return {
        title: "Guest is quickest",
        detail:
          "Add your name, email, and UK phone number. No account is needed.",
      };
    }

    if (activeStep === "payment" && canCheckout) {
      return {
        title: "Ready when you are",
        detail:
          paymentChoice === "online"
            ? "Card payment opens securely with Stripe."
            : "Cash orders go straight to the restaurant for confirmation.",
      };
    }

    return {
      title: "Everything looks good",
      detail:
        "Follow the next step below and your order will be ready to send.",
    };
  }

  const smartSuggestion = getNextHint();

  function QuantityControl({ item }: { item: (typeof cartItems)[number] }) {
    return (
      <div className="grid h-10 grid-cols-[38px_34px_38px] overflow-hidden rounded-full border border-white/12 bg-white/10 text-white">
        <button
          type="button"
          onClick={() => decreaseItem(item.id)}
          className="flex items-center justify-center transition hover:bg-white/12 hover:text-[#F4B400]"
          aria-label={`Decrease ${item.name}`}
        >
          <Minus size={15} aria-hidden="true" />
        </button>
        <span className="flex items-center justify-center text-sm font-black">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => addItem(item)}
          className="flex items-center justify-center transition hover:bg-white/12 hover:text-[#F4B400]"
          aria-label={`Increase ${item.name}`}
        >
          <Plus size={15} aria-hidden="true" />
        </button>
      </div>
    );
  }

  function ValidationMessage({
    children,
    tone = "warning",
  }: {
    children: ReactNode;
    tone?: "warning" | "error";
  }) {
    return (
      <p
        className={`mt-4 flex gap-2 rounded-lg border p-3 text-xs font-bold leading-6 ${
          tone === "error"
            ? "border-red-400/35 bg-red-500/10 text-red-100"
            : "border-[#E52B2B]/35 bg-[#E52B2B]/10 text-[#F4B400]"
        }`}
      >
        <AlertCircle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
        {children}
      </p>
    );
  }

  function renderStepHeader() {
    return (
      <div className="rounded-lg border border-white/10 bg-[#1A1A1A] p-4 text-white shadow-[0_22px_54px_rgba(0,0,0,0.28)] sm:p-5">
        <div className="grid grid-cols-4 gap-1">
          {checkoutSteps.map((step, index) => {
            const active = step.id === activeStep;
            const unlocked = isStepUnlocked(step.id);
            const lineDone = index <= activeStepIndex;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                disabled={!unlocked}
                aria-pressed={active}
                className="group min-w-0 text-center disabled:cursor-not-allowed"
              >
                <span className="relative flex items-center justify-center">
                  {index > 0 ? (
                    <span
                      className={`absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${
                        lineDone ? "bg-[#E52B2B]" : "bg-white/12"
                      }`}
                    />
                  ) : null}
                  {index < checkoutSteps.length - 1 ? (
                    <span
                      className={`absolute left-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${
                        index < activeStepIndex ? "bg-[#E52B2B]" : "bg-white/12"
                      }`}
                    />
                  ) : null}
                  <span
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ring-4 ring-[#1A1A1A] transition ${
                      active
                        ? "bg-[#E52B2B] text-white shadow-lg shadow-[#E52B2B]/15"
                        : step.complete
                          ? "bg-[#E52B2B] text-white"
                          : unlocked
                              ? "bg-white/16 text-white group-hover:bg-white/24"
                            : "bg-white/8 text-white/40"
                    }`}
                  >
                    {step.complete ? (
                      <CheckCircle2 size={15} aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                </span>
                <span
                  className={`mt-3 block truncate text-xs font-black sm:text-sm ${
                    active ? "text-[#F4B400]" : "text-white/55"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col justify-between gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              {currentStep?.title ?? "Checkout"}
            </h1>
            <p className="mt-1 text-sm leading-6 text-white/58">
              Step {activeStepIndex + 1} of {checkoutSteps.length}:{" "}
              {currentStep?.detail}
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 text-sm font-black text-white transition hover:border-[#E52B2B] hover:text-[#F4B400]"
          >
            <Plus size={16} aria-hidden="true" />
            Add dishes
          </Link>
        </div>
      </div>
    );
  }

  function renderFoodStep() {
    return (
      <div className={checkoutCardClass}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className={checkoutEyebrowClass}>
              Order
            </p>
            <h2 className="mt-1 text-2xl font-black">Review your food</h2>
            <p className="mt-2 text-sm leading-6 text-white/58">
              Check quantities, remove anything you do not need, and review the
              Spice Fusion TAKEAWAY collection offer before moving on.
              
            </p>
          </div>
          {cartItems.length > 0 ? (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 text-xs font-black uppercase text-white/58 transition hover:border-[#E52B2B]/55 hover:text-[#F4B400]"
            >
              <Trash2 size={14} aria-hidden="true" />
              Clear order
            </button>
          ) : null}
        </div>

        {cartItems.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-white/18 bg-white/6 p-8 text-center">
            <ShoppingBag
              className="mx-auto text-[#E52B2B]"
              size={34}
              aria-hidden="true"
            />
            <h3 className="mt-4 text-2xl font-black">Your cart is empty</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-white/58">
              Pick your dishes first. Popular choices are near the top of the
              menu.
            </p>
            <Link
              href="/menu#popular-picks"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-5 text-sm font-black text-white transition hover:bg-white hover:text-[#121212]"
            >
              <Sparkles size={16} aria-hidden="true" />
              Browse favourites
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {cartItems.map((item) => (
              <article
                key={item.id}
                className="grid gap-4 rounded-lg border border-white/10 bg-white/6 p-4 shadow-sm transition hover:border-[#E52B2B]/35 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <h3 className="break-words font-black">{item.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-white/50">
                    {item.category} - <Price value={item.priceLabel} />
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <QuantityControl item={item} />
                  <p className="w-20 text-right font-black text-[#E52B2B]">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 text-white/58 transition hover:border-[#E52B2B]/55 hover:text-[#F4B400]"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-lg border border-[#E52B2B]/25 bg-[#E52B2B]/10 p-4">
          <div className="flex items-center gap-2 text-[#F4B400]">
            <BadgePercent size={20} aria-hidden="true" />
            <h3 className="font-black">Active offer</h3>
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-[#0F0B09] p-4 shadow-sm">
            <p className="font-black text-[#E52B2B]">{reward.title}</p>
            <p className="mt-2 text-sm leading-6 text-white/62">
              {reward.detail}
            </p>
            {reward.requiresSideDish ? (
              <label className="mt-4 block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#F4B400]">
                  Choose your free side dish
                </span>
                <select
                  value={selectedSideDishId}
                  onChange={(event) => setSelectedSideDishId(event.target.value)}
                  className="mt-2 h-12 w-full rounded-lg border border-white/12 bg-white px-3 text-sm font-bold text-[#121212] outline-none transition focus:border-[#E52B2B] focus:ring-4 focus:ring-[#E52B2B]/18"
                >
                  <option value="">Select a side dish</option>
                  {sideDishOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {!selectedSideDishId ? (
                  <p className="mt-2 text-xs font-bold text-white/58">
                    Required before checkout for this offer.
                  </p>
                ) : null}
              </label>
            ) : null}
          </div>

        </div>
      </div>
    );
  }

  function renderFulfilmentStep() {
    return (
      <div className={checkoutCardClass}>
        <p className={checkoutEyebrowClass}>
          Method
        </p>
        <h2 className="mt-1 text-2xl font-black">Collection or delivery</h2>
        <p className={`mt-2 ${checkoutMutedClass}`}>
          Choose collection from 137 Main St, Addingham or check delivery with your
          postcode.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(["collection", "delivery"] as const).map((type) => {
            const active = orderType === type;
            const Icon = type === "collection" ? Store : Truck;

            return (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                aria-pressed={active}
                className={`rounded-lg border p-4 text-left transition ${
                  active
                    ? "border-[#E52B2B]/80 bg-[#E52B2B] text-white shadow-lg shadow-[#E52B2B]/15"
                    : "border-white/10 bg-white/8 text-white hover:border-[#E52B2B]/35"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <Icon
                    className={active ? "text-[#121212]" : "text-[#E52B2B]"}
                    size={22}
                    aria-hidden="true"
                  />
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${
                      active
                        ? "bg-[#121212]/12 text-[#121212]"
                        : "bg-white/10 text-white/75"
                    }`}
                  >
                    {active ? "Selected" : "Tap to choose"}
                  </span>
                </div>
                <span className="mt-3 block text-lg font-black capitalize">
                  {type}
                </span>
                <span
                  className={`mt-2 block text-sm leading-6 ${
                    active ? "text-[#121212]/72" : "text-white/58"
                  }`}
                >
                  {type === "collection"
                    ? `Pick up from ${restaurant.location}.`
                    : "Delivery on orders £20+ within a 5-mile radius for LS29 area."}
                </span>
              </button>
            );
          })}
        </div>

        {orderType === "delivery" ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-black">
              Delivery postcode
              <input
                value={customer.postcode}
                onChange={(event) =>
                  updateCustomer("postcode", event.target.value)
                }
                className={`mt-2 h-12 w-full rounded-lg border px-3 text-sm font-semibold uppercase outline-none transition placeholder:text-white/35 focus:ring-4 ${
                  customer.postcode && !deliveryPostcodeValid
                    ? "border-red-400/55 bg-red-500/10 text-white focus:border-red-400 focus:ring-red-400/15"
                    : "border-white/12 bg-white/8 text-white placeholder:text-white/35 focus:border-[#E52B2B]/65 focus:ring-[#E52B2B]/12"
                }`}
                type="text"
                autoComplete="postal-code"
                placeholder="LS29 0LZ"
              />
            </label>
            <label className="text-sm font-black sm:col-span-2">
              Delivery address
              <textarea
                value={customer.address}
                onChange={(event) => updateCustomer("address", event.target.value)}
                className={`${checkoutFieldClass} min-h-28 py-3`}
                placeholder="House number, street, flat number, delivery notes"
              />
            </label>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-white/10 bg-white/6 p-4">
            <p className="font-black">Collection address</p>
            <p className="mt-2 text-sm leading-6 text-white/58">
              {restaurant.address.join(", ")}
            </p>
          </div>
        )}

        {orderType === "delivery" && !deliveryMinimumValid ? (
          <ValidationMessage tone="error">
            Delivery requires a minimum order of{" "}
            {formatCurrency(DELIVERY_MINIMUM)}. Add{" "}
            {formatCurrency(DELIVERY_MINIMUM - subtotal)} more from the menu.
          </ValidationMessage>
        ) : null}
        {orderType === "delivery" &&
        customer.postcode &&
        !deliveryPostcodeValid ? (
          <ValidationMessage tone="error">
            Delivery is currently available for LS29 area postcodes only.
          </ValidationMessage>
        ) : null}
      </div>
    );
  }

  function renderDetailsStep() {
    return (
      <div className={checkoutCardClass}>
        <p className={checkoutEyebrowClass}>
          Your details
        </p>
        <h2 className="mt-1 text-2xl font-black">Guest checkout or sign in</h2>
        <p className={`mt-2 ${checkoutMutedClass}`}>
          Continue quickly as a guest, or sign in to save this order to your
          Spice Fusion TAKEAWAY account.
        </p>
        {accountEmail ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold leading-6 text-emerald-900">
            Signed in as <span className="font-black">{accountEmail}</span>.
            This order will be saved to your account.
          </p>
        ) : null}

        {!accountEmail ? (
          <>
            <div className="mt-5 grid gap-1 rounded-lg border border-white/10 bg-white/6 p-1 text-sm sm:grid-cols-2">
              {[
                {
                  icon: User,
                  id: "guest" as const,
                  label: "Guest checkout",
                },
                {
                  icon: LogIn,
                  id: "sign-in" as const,
                  label: "Sign in",
                },
              ].map((mode) => {
                const active = checkoutAccountMode === mode.id;
                const Icon = mode.icon;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setCheckoutAccountMode(mode.id);
                      setAccountNotice(null);
                    }}
                    aria-pressed={active}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-3 py-2 font-black transition ${
                      active
                        ? "bg-[#E52B2B] text-white shadow-sm"
                        : "text-white/64 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {checkoutAccountMode === "sign-in" ? (
              <div className="mt-4 rounded-lg border border-white/10 bg-white/6 p-4">
                <button
                  type="button"
                  onClick={startGoogleCheckoutSignIn}
                  disabled={accountOAuthLoading}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-black text-[#121212] shadow-[0_14px_32px_rgba(0,0,0,0.18)] transition hover:bg-[#F4B400] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <GoogleMark />
                  {accountOAuthLoading ? "Opening Google..." : "Continue with Google"}
                </button>
                <div className="my-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-white/38">
                  <span className="h-px flex-1 bg-white/10" />
                  <span>Email</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold leading-6 text-white/58">
                  Use your existing account password.
                  <Link
                    className="text-[#F4B400] underline-offset-4 hover:underline"
                    href="/account/forgot-password"
                  >
                    Forgot password?
                  </Link>
                </p>
              </div>
            ) : null}
          </>
        ) : null}

        {accountNotice ? (
          <div
            className={`mt-4 rounded-lg border p-3 text-sm font-bold leading-6 ${
              accountNotice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <div className="flex gap-2">
              {accountNotice.tone === "success" ? (
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
              ) : (
                <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
              )}
              <p>{accountNotice.message}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-black">
            Full name
            <input
              value={customer.name}
              onChange={(event) => updateCustomer("name", event.target.value)}
              className={`${checkoutFieldClass} h-12`}
              type="text"
              autoComplete="name"
              placeholder="Your name"
              required
            />
          </label>
          <label className="text-sm font-black">
            Email
            <input
              value={customer.email}
              onChange={(event) => updateCustomer("email", event.target.value)}
              className={`${checkoutFieldClass} h-12`}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="text-sm font-black">
            UK phone number
            <input
              value={customer.phone}
              onChange={(event) => updateCustomer("phone", event.target.value)}
              className={`mt-2 h-12 w-full rounded-lg border px-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:ring-4 ${
                customer.phone && !phoneValid
                  ? "border-red-400/55 bg-red-500/10 focus:border-red-400 focus:ring-red-400/15"
                  : "border-white/12 bg-white/8 focus:border-[#E52B2B]/65 focus:ring-[#E52B2B]/12"
              }`}
              type="tel"
              autoComplete="tel"
              placeholder="07123 456789 or +44 7123 456789"
              required
            />
          </label>
          {accountPasswordRequired ? (
            <label className="text-sm font-black">
              Password
              <input
                value={customer.password}
                onChange={(event) =>
                  updateCustomer("password", event.target.value)
                }
                className={`${checkoutFieldClass} h-12`}
                type="password"
                autoComplete="current-password"
                placeholder="Your account password"
                required
              />
            </label>
          ) : null}
        </div>

        <label className="mt-5 block text-sm font-black">
          Order notes
          <textarea
            value={customer.notes}
            onChange={(event) => updateCustomer("notes", event.target.value)}
            className={`${checkoutFieldClass} min-h-24 py-3`}
            placeholder="Spice level, timing, or special requests"
          />
        </label>

        {customer.phone && !phoneValid ? (
          <ValidationMessage tone="error">
            Enter a valid UK phone number to continue.
          </ValidationMessage>
        ) : null}
        {customer.email && !emailValid ? (
          <ValidationMessage tone="error">
            Enter a valid email address for order updates.
          </ValidationMessage>
        ) : null}
        {accountPasswordRequired &&
        customer.password &&
        !accountPasswordValid ? (
          <ValidationMessage>
            Use at least 6 characters for the account password.
          </ValidationMessage>
        ) : null}
      </div>
    );
  }

  function renderPaymentStep() {
    return (
      <div className={checkoutCardClass}>
        <p className={checkoutEyebrowClass}>
          Payment
        </p>
        <h2 className="mt-1 text-2xl font-black">Payment method</h2>
        <p className={`mt-2 ${checkoutMutedClass}`}>
          Choose secure card payment or cash. You will see the final total
          before sending the order.
        </p>

        <StoreStatusNotice className="mt-5" storeStatus={storeStatus} />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            {
              id: "online" as const,
              title: "Pay online by card",
              detail: "Secure card payment opens after you place the order.",
              icon: CreditCard,
            },
            {
              id: "cash" as const,
              title:
                orderType === "collection"
                  ? "Pay cash on collection"
                  : "Pay cash on delivery",
              detail:
                "Send the order now and pay when it is handed over.",
              icon: Banknote,
            },
          ].map((option) => {
            const active = paymentChoice === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPaymentChoice(option.id)}
                aria-pressed={active}
                className={`rounded-lg border p-4 text-left transition ${
                  active
                    ? "border-[#E52B2B]/70 bg-[#E52B2B] text-white shadow-lg shadow-[#E52B2B]/15"
                    : "border-white/10 bg-white/8 text-white hover:border-[#E52B2B]/35"
                }`}
              >
                <Icon
                  className={active ? "text-[#121212]" : "text-[#E52B2B]"}
                  size={22}
                  aria-hidden="true"
                />
                <span className="mt-3 block text-lg font-black">
                  {option.title}
                </span>
                <span
                  className={`mt-2 block text-sm leading-6 ${
                    active ? "text-[#121212]/72" : "text-white/58"
                  }`}
                >
                  {option.detail}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-4 text-sm text-emerald-50">
          <Lock className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
          <div>
            <p className="font-black">Secure checkout</p>
            <p className="mt-1 leading-6">
              Online card payments open securely with Stripe. Cash orders are
              sent straight to the restaurant.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/6 p-4">
          <h3 className="flex items-center gap-2 font-black">
            <ReceiptText size={18} aria-hidden="true" />
            Final check
          </h3>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-white/58">Customer</span>
              <span className="text-right font-black">
                {customer.name || "Not added"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/58">Order type</span>
              <span className="font-black capitalize">{orderType}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/58">Payment</span>
              <span className="text-right font-black">
                {paymentChoice === "online" ? "Online card" : "Cash"}
              </span>
            </div>
            {deliveryFee > 0 ? (
              <div className="flex justify-between gap-4">
                <span className="text-white/58">Delivery charge</span>
                <span className="font-black">{formatCurrency(deliveryFee)}</span>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-white/10 pt-3 text-lg">
              <span className="font-black">Total</span>
              <span className="font-black text-[#E52B2B]">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {!canCheckout ? (
          <ValidationMessage>
            {orderingAllowed
              ? "Complete the previous steps before placing the order."
              : storeStatus?.message ?? "Ordering is currently unavailable."}
          </ValidationMessage>
        ) : null}
        {checkoutError ? (
          <ValidationMessage tone="error">{checkoutError}</ValidationMessage>
        ) : null}

        <button
          type="button"
          onClick={
            paymentChoice === "online" ? startOnlineCheckout : placeCashOrder
          }
          disabled={!canCheckout || checkingOut}
          className={`${checkoutPrimaryButtonClass} mt-5 w-full`}
        >
          {paymentChoice === "online" ? (
            <CreditCard size={17} aria-hidden="true" />
          ) : (
            <Banknote size={17} aria-hidden="true" />
          )}
          {checkingOut
            ? paymentChoice === "online"
              ? "Opening payment..."
              : "Sending order..."
            : paymentChoice === "online"
              ? "Continue to secure card payment"
              : "Place cash order"}
        </button>
      </div>
    );
  }

  function renderStepContent() {
    if (activeStep === "food") {
      return renderFoodStep();
    }

    if (activeStep === "fulfilment") {
      return renderFulfilmentStep();
    }

    if (activeStep === "details") {
      return renderDetailsStep();
    }

    return renderPaymentStep();
  }

  function renderStepActions() {
    const isLastStep = activeStep === "payment";
    const currentComplete = checkoutSteps.find(
      (step) => step.id === activeStep,
    )?.complete;

    if (isLastStep) {
      return null;
    }

    return (
      <div className="rounded-[22px] border border-white/10 bg-[#1A1A1A] p-4 shadow-[0_22px_54px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={activeStepIndex === 0}
            className={checkoutSecondaryButtonClass}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!currentComplete}
            className={checkoutPrimaryButtonClass}
          >
            Continue
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  function renderOrderSummary() {
    return (
      <aside className="h-fit rounded-lg border border-white/10 bg-[#1A1A1A] p-5 text-white shadow-[0_22px_54px_rgba(0,0,0,0.28)] lg:sticky lg:top-24">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E52B2B] text-white">
            <ReceiptText size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B]">
              Your basket
            </p>
            <h2 className="text-2xl font-black">Order summary</h2>
          </div>
        </div>

        <div className="mt-5 space-y-3 rounded-lg border border-white/10 bg-white/6 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-white/58">Items</span>
            <span className="font-black">{itemCount}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/58">Subtotal</span>
            <span className="font-black">{formatCurrency(subtotal)}</span>
          </div>
          {collectionDiscount > 0 ? (
            <div className="flex justify-between gap-4">
              <span className="text-white/58">
                {orderType === "delivery" ? "Delivery discount" : "Collection discount"}
              </span>
              <span className="font-black text-[#E52B2B]">
                -{formatCurrency(collectionDiscount)}
              </span>
            </div>
          ) : null}
          {deliveryFee > 0 ? (
            <div className="flex justify-between gap-4">
              <span className="text-white/58">Delivery charge</span>
              <span className="font-black">{formatCurrency(deliveryFee)}</span>
            </div>
          ) : null}
          {reward.type !== "none" ? (
            <div className="flex justify-between gap-4">
              <span className="text-white/58">Offer</span>
              <span className="text-right font-black text-[#E52B2B]">
                {reward.title}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <span className="text-white/58">Order type</span>
            <span className="font-black capitalize">{orderType}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/10 pt-3 text-lg">
            <span className="font-black">Total</span>
            <span className="font-black text-[#E52B2B]">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="smart-suggestion mt-5 rounded-lg border border-[#E52B2B]/20 bg-[#E52B2B]/10 p-4">
          <h3 className="flex items-center gap-2 font-black text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E52B2B] text-white">
              <Sparkles size={16} aria-hidden="true" />
            </span>
            Smart suggestion
          </h3>
          <p className="mt-3 font-black">{smartSuggestion.title}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/62">
            {smartSuggestion.detail}
          </p>
          {"href" in smartSuggestion && smartSuggestion.href ? (
            <Link
              href={smartSuggestion.href}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#E52B2B] px-4 text-sm font-black text-white transition hover:bg-white hover:text-[#121212]"
            >
              {smartSuggestion.action}
            </Link>
          ) : null}
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/6 p-4">
          <h3 className="flex items-center gap-2 font-black">
            <ClipboardList size={18} aria-hidden="true" />
            Checkout status
          </h3>
          <div className="mt-4 grid gap-2">
            {checkoutSteps.map((step) => (
              <div key={step.id} className="flex items-start gap-3">
                <CheckCircle2
                  className={`mt-0.5 shrink-0 ${
                    step.complete ? "text-[#E52B2B]" : "text-white/28"
                  }`}
                  size={17}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-black">{step.label}</p>
                  <p className="mt-0.5 text-xs font-semibold leading-5 text-white/55">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <section className="bg-[#121212] px-4 pb-28 pt-6 text-white sm:px-6 sm:pt-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        {renderStepHeader()}
        <StoreStatusNotice className="mt-5" storeStatus={storeStatus} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start">
          <div className="grid gap-5">
            {renderStepContent()}
            {renderStepActions()}
          </div>
          {renderOrderSummary()}
        </div>
      </div>

      {cartItems.length > 0 ? (
        <div className="fixed bottom-4 left-4 right-4 z-30 grid h-16 grid-cols-[1fr_auto] items-center gap-3 rounded-full bg-[#111111] px-5 text-white shadow-2xl shadow-black/25 lg:hidden">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white/70">
              Step {activeStepIndex + 1} of {checkoutSteps.length}:{" "}
              {checkoutSteps[activeStepIndex]?.label}
            </p>
            <p className="text-base font-black">{formatCurrency(total)}</p>
          </div>
          {activeStep === "payment" ? (
            <button
              type="button"
              onClick={
                paymentChoice === "online" ? startOnlineCheckout : placeCashOrder
              }
              disabled={!canCheckout || checkingOut}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#E52B2B] px-4 text-sm font-black text-[#121212] disabled:opacity-60"
            >
              Pay
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={
                !checkoutSteps.find((step) => step.id === activeStep)?.complete
              }
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#E52B2B] px-4 text-sm font-black text-[#121212] disabled:opacity-60"
            >
              Continue
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}
