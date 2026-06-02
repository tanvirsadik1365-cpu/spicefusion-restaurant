import { restaurant } from "@/lib/restaurant";

type ReadyEmailOrder = {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  orderType: string;
  readyAt: string | null;
};

type ResendEmailResponse = {
  id?: string;
  message?: string;
  name?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatReadyTime(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getOrderReadyCopy(orderType: string) {
  if (orderType === "delivery") {
    return {
      detail:
        "Please be ready to receive your order. Our rider is on the way.",
      headline: "Your food is on the way",
      subject: `Your ${restaurant.shortName} order is on the way`,
    };
  }

  return {
    detail: `Please collect your order from ${restaurant.name}.`,
    headline: "Your food is ready for collection",
    subject: `Your ${restaurant.shortName} order is ready for collection`,
  };
}

function buildReadyEmailHtml(order: ReadyEmailOrder) {
  const copy = getOrderReadyCopy(order.orderType);
  const readyTime = formatReadyTime(order.readyAt);

  return `
    <div style="font-family:Arial,sans-serif;color:#211A18;line-height:1.6">
      <h1 style="color:#121212">${escapeHtml(copy.headline)}</h1>
      <p>Hello ${escapeHtml(order.customerName || "there")},</p>
      <p>${escapeHtml(copy.detail)}</p>
      <p><strong>Order:</strong> ${escapeHtml(order.orderNumber)}</p>
      ${
        readyTime
          ? `<p><strong>Marked ready:</strong> ${escapeHtml(readyTime)}</p>`
          : ""
      }
      <p>If you need help, call us on ${escapeHtml(
        restaurant.secondaryPhone || restaurant.phone,
      )}.</p>
      <p>Thank you,<br />${escapeHtml(restaurant.name)}</p>
    </div>
  `;
}

function buildReadyEmailText(order: ReadyEmailOrder) {
  const copy = getOrderReadyCopy(order.orderType);
  const readyTime = formatReadyTime(order.readyAt);

  return [
    copy.headline,
    "",
    `Hello ${order.customerName || "there"},`,
    copy.detail,
    `Order: ${order.orderNumber}`,
    readyTime ? `Marked ready: ${readyTime}` : "",
    `If you need help, call us on ${restaurant.secondaryPhone || restaurant.phone}.`,
    "",
    `Thank you,`,
    restaurant.name,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendOrderReadyEmail(order: ReadyEmailOrder) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.ORDER_EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from || !order.customerEmail) {
    return {
      sent: false,
      skippedReason:
        "Order ready email skipped because RESEND_API_KEY, ORDER_EMAIL_FROM, or customer email is missing.",
    };
  }

  const copy = getOrderReadyCopy(order.orderType);
  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html: buildReadyEmailHtml(order),
      reply_to:
        process.env.ORDER_EMAIL_REPLY_TO?.trim() ||
        restaurant.email ||
        undefined,
      subject: copy.subject,
      text: buildReadyEmailText(order),
      to: [order.customerEmail],
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as
    ResendEmailResponse;

  if (!response.ok) {
    throw new Error(
      payload.message ||
        payload.name ||
        "Order ready email could not be sent.",
    );
  }

  return {
    id: payload.id ?? "",
    sent: true,
  };
}



