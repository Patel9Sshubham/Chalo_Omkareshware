function buildGoogleMapsLink(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildBookingTracking(booking) {
  const pickupLink = buildGoogleMapsLink(booking.pickup);
  const destinationLink = buildGoogleMapsLink(booking.destination);
  const routeLink = buildGoogleMapsLink(`${booking.pickup} to ${booking.destination}`);

  return {
    pickupLink,
    destinationLink,
    routeLink,
    statusLabel: booking.status.replace(/_/g, " "),
    etaMinutes: booking.estimatedTimeMinutes || 0
  };
}

export async function sendWhatsAppMessage({ to, body }) {
  const accountSid = process.env.WHATSAPP_ACCOUNT_SID;
  const authToken = process.env.WHATSAPP_AUTH_TOKEN;
  const from = process.env.WHATSAPP_FROM_NUMBER;

  if (!accountSid || !authToken || !from || !to) {
    console.info("WhatsApp message skipped. Missing WhatsApp credentials or recipient.", { to, body });
    return { sent: false, reason: "missing_credentials" };
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      From: `whatsapp:${from}`,
      To: `whatsapp:${to}`,
      Body: body
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp send failed: ${errorText}`);
  }

  return { sent: true };
}
