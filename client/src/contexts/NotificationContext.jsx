import React, { useCallback, useEffect, useMemo, useState } from "react";
import api, { ENDPOINTS, fetchCurrentUser, getStoredSession } from "../lib/api";
import { requestForToken, onMessageListener } from "../config/firebase";
import { NotificationContext } from "./NotificationContextBase";

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token, user } = getStoredSession();
  const [sessionUser, setSessionUser] = useState(user);
  const userId = sessionUser?.id || sessionUser?._id;

  useEffect(() => {
    let isActive = true;

    if (!token || sessionUser) {
      return () => {
        isActive = false;
      };
    }

    fetchCurrentUser()
      .then((nextUser) => {
        if (isActive) {
          setSessionUser(nextUser);
        }
      })
      .catch(() => {
        if (isActive) {
          setSessionUser(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [token, sessionUser]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await api.get(ENDPOINTS.NOTIFICATIONS.BASE);
      if (data) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [userId]);

  const registerDevice = useCallback(async () => {
    if (!userId) return;
    const token = await requestForToken();
    if (token) {
      try {
        await api.post(ENDPOINTS.NOTIFICATIONS.FCM_TOKEN, { token });
      } catch (error) {
        console.error("Failed to register FCM token:", error);
      }
    }
  }, [userId]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(ENDPOINTS.NOTIFICATIONS.READ(id));
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put(ENDPOINTS.NOTIFICATIONS.READ_ALL);
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    registerDevice();
  }, [fetchNotifications, registerDevice, userId]);

  useEffect(() => {
    if (!userId) return undefined;
    let isActive = true;
    let syncTimer;

    const listen = async () => {
      try {
        const payload = await onMessageListener();
        if (!isActive) return;

        const newNotification = {
          _id: `local-${Date.now()}`,
          title: payload.notification?.title || "New Notification",
          message: payload.notification?.body || "",
          type: payload.data?.type || "system",
          url: payload.data?.url || "/overview",
          read: false,
          createdAt: new Date().toISOString(),
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        syncTimer = window.setTimeout(fetchNotifications, 2000);
        listen();
      } catch (error) {
        if (isActive) console.error("Message listener error:", error);
      }
    };

    listen();

    return () => {
      isActive = false;
      if (syncTimer) window.clearTimeout(syncTimer);
    };
  }, [fetchNotifications, userId]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  }), [notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

