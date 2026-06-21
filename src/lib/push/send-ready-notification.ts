import webpush from "web-push";

type StoredSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

export async function sendReadyNotification(customerName: string, subscription: StoredSubscription | null) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subscription || !publicKey || !privateKey) return;

  webpush.setVapidDetails("mailto:sozo-coffee@example.com", publicKey, privateKey);
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Sozo Coffee",
        body: `${customerName}님, 커피가 준비됐어요.`,
        url: "/order",
      }),
    );
  } catch (error) {
    console.error("Web push delivery failed", error);
  }
}
