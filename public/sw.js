self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Sozo Coffee", {
      body: data.body ?? "커피가 준비되었습니다.",
      data: { url: data.url ?? "/order" },
      tag: "sozo-coffee-ready",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url ?? "/order"));
});
