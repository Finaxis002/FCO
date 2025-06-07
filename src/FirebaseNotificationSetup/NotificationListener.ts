// src/NotificationListener.js
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

const NotificationListener = () => {
  useEffect(() => {
    // This will trigger when the app is in the foreground and receives a notification
    onMessage(messaging, (payload) => {
      console.log("Message received: ", payload);
      // You can handle the payload here, e.g., display a custom notification
    });
  }, []);

  return null;
};

export default NotificationListener;
