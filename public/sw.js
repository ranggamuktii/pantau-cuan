self.addEventListener('push', function (e) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    if (e.data) {
        var msg = e.data.json();
        e.waitUntil(self.Notification.showNotification(msg.title, {
            body: msg.body,
            icon: msg.icon || '/logo.png',
            actions: msg.actions,
            data: msg.data
        }));
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url == '/' && 'focus' in client)
                return client.focus();
        }
        if (clients.openWindow) {
            return clients.openWindow(event.notification.data?.url || '/');
        }
    }));
});
