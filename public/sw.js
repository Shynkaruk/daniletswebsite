// public/sw.js — Service Worker для Web Push повідомлень
// Цей файл обробляє push-події від сервера і показує сповіщення у браузері.

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "New Notification", body: event.data?.text() || "" };
  }

  const title = data.title || "Danilets — New Request";
  const options = {
    body: data.body || "A new quote request has been submitted.",
    icon: "/Symbol_D_filled with white.svg",
    badge: "/Symbol_D_filled with white.svg",
    data: { url: data.url || "/admin" },
    requireInteraction: true,
    tag: "new-request",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
