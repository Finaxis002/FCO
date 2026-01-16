import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";
import { useAutoLogout } from "@/hooks/useAutoLogout";

const Login = () => {
  const navigate = useNavigate();
  const { setLoginTime } = useAutoLogout();

  const [isAdminLogin, setIsAdminLogin] = useState(true);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom CAPTCHA states
  const [captchaText, setCaptchaText] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");

  // Generate random CAPTCHA text
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserCaptchaInput("");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
    generateCaptcha();
  }, [navigate]);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        console.log("Service Worker ready");
      })
      .catch((error) => {
        console.error("Service Worker is not ready", error);
      });
  }

  const subscribeToPushNotifications = async (
    userId: string,
    token: string
  ) => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      await navigator.serviceWorker.register("/service-worker.js");

      const swRegistration = await navigator.serviceWorker.ready;

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          "BFiAnzKqV9C437P10UIT5_daMne46XuJiVuSn4zQh2MQBjUIwMP9PMgk2TFQL9LOSiQy17eie7XRYZcJ0NE7jMs",
      });

      try {
        const response = await fetch(
          "https://tumbledrybe.sharda.co.in/api/pushnotifications/save-subscription",
          {
            method: "POST",
            body: JSON.stringify({
              userId,
              subscription,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save subscription");
        }
        console.log("Subscription saved.");
      } catch (error) {
        console.error("Failed to save subscription:", error);
      }
    } else {
      console.error("Notification permission denied.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Verify CAPTCHA
    if (userCaptchaInput !== captchaText) {
      setError("Invalid CAPTCHA - Please enter the correct code");
      generateCaptcha();
      return;
    }

    try {
      const res = await axios.post(
        "https://tumbledrybe.sharda.co.in/api/auth/login",
        {
          userId,
          password,
          isAdminLogin,
          recaptchaToken: "manual-captcha-verified",
        }
      );

      const { token, role, user } = res.data;

      if (isAdminLogin && role !== "Admin") {
        setError("Only administrators can login through this portal");
        return;
      }

      let fullUser = user;

      if (role !== "Admin") {
        try {
          const userRes = await axios.get(
            `https://tumbledrybe.sharda.co.in/api/users/${user._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          fullUser = userRes.data;
        } catch (fetchErr) {
          console.error("Failed to fetch full user data:", fetchErr);
        }
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("user", JSON.stringify(fullUser));

      setLoginTime();

      subscribeToPushNotifications(fullUser._id, token).finally(() => {
        window.location.href =
          role === "Admin" ? "/admin-dashboard" : "/user-dashboard";
      });

      navigate(role === "Admin" ? "/admin-dashboard" : "/user-dashboard");
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError(
          err.response.data.message ||
            "Too many attempts. Please try again later."
        );
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
      generateCaptcha();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
        <div className="bg-[#2EB873] h-3 w-full"></div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="text-3xl font-bold text-[#2EB873] mb-1">
              FCA - Tumbledry
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
            {isAdminLogin ? "Admin Dashboard" : "User Dashboard"}
          </h2>

          <div className="mb-8">
            <div className="relative flex items-center bg-gray-100 rounded-full p-1">
              <button
                type="button"
                onClick={() => setIsAdminLogin(true)}
                className={`relative flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                  isAdminLogin
                    ? "bg-[#2EB873] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Admin
                {isAdminLogin && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-5/6 h-0.5 bg-white rounded-full"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsAdminLogin(false)}
                className={`relative flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                  !isAdminLogin
                    ? "bg-[#2EB873] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                User
                {!isAdminLogin && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-5/6 h-0.5 bg-white rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center border border-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {isAdminLogin ? "Admin ID" : "Email or Username"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  id="userId"
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder={
                    isAdminLogin ? "admin@example.com" : "you@example.com"
                  }
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Simple CAPTCHA - Document 2 Style */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Enter CAPTCHA
              </label>

              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-gray-300 rounded-lg py-3 px-4 select-none">
                  <p
                    className="text-center text-xl font-bold tracking-widest text-gray-700 select-none break-all"
                    style={{
                      fontFamily: "monospace",
                      letterSpacing: "0.2em",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {captchaText}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-3 bg-[#2EB873] text-white rounded-lg hover:bg-[#1e6b52] transition-colors flex-shrink-0"
                  title="Refresh CAPTCHA"
                >
                  <FiRefreshCw className="h-5 w-5" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Enter the code above"
                value={userCaptchaInput}
                onChange={(e) => setUserCaptchaInput(e.target.value)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#2EB873] hover:bg-[#1e6b52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2EB873] transition"
              >
                Log in
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;