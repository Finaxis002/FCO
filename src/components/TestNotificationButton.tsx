import { error } from "node:console";
import { useState } from "react";

function TestNotificationButton() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(''); // To track and display status
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const sendTestNotification = async () => {
    if (!message.trim()) {
      setStatus('Please enter a message');
      return;
    }

    setIsLoading(true);
    setStatus('Sending...');

    try {
      const response = await fetch("https://tumbledrybe.sharda.co.in/api/pushnotifications/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: "6847c6e8ad5b050175eb51c9", // Replace with actual user ID
          message: message // Using the state variable
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send notification");
      }

      setStatus('Notification sent successfully!');
      console.log("Notification sent:", data);
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
      console.error("Error sending notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>Test Push Notification</h3>
      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />
      <button 
        onClick={sendTestNotification}
        disabled={isLoading || !message.trim()}
        style={{ padding: '8px 16px', marginBottom: '10px' }}
      >
        {isLoading ? 'Sending...' : 'Send Test Notification'}
      </button>
      {status && <div style={{ 
        color: status.includes('Error') ? 'red' : 'green',
        marginTop: '10px'
      }}>{status}</div>}
    </div>
  );
}

export default TestNotificationButton;