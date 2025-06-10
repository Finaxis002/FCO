import { useState } from "react";

function TestNotificationButton() {
  const [message, setMessage] = useState('');

  const sendTestNotification = async () => {
    try {
      const response = await fetch("https://tumbledrybe.sharda.co.in/api/pushnotifications/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: "6847c6e8ad5b050175eb51c9", // Replace with actual user ID
          message: "This is a test push notification!"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      console.log("Notification sent successfully!");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <div>
      <button onClick={sendTestNotification}>Send Test Notification</button>
      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
    </div>
  );
}

export default TestNotificationButton;
