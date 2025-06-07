// src/RequestNotificationPermission.ts
import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

const RequestNotificationPermission = () => {
  useEffect(() => {
    // Request permission to show notifications
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");

        // Get the FCM token after permission is granted
        getToken(messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY, // Optional for web push
        })
          .then((currentToken) => {
            if (currentToken) {
              console.log("FCM Token: ", currentToken);
              // Send this token to your backend to subscribe the user for notifications
            } else {
              console.log("No token available. Request permission to get one.");
            }
          })
          .catch((err) => {
            console.log("An error occurred while retrieving token. ", err);
          });
      } else {
        console.log("Notification permission denied.");
      }
    });
  }, []);

  return null;
};

export default RequestNotificationPermission;
