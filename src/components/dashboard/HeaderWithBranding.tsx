import React from "react";
import logo from "../../assets/sharda-logo.png"; // Adjust the path as necessary

interface HeaderWithBrandingProps {
  currentUser: {
    name: string;
    role?: string;
    avatar?: string;
  };
}

function HeaderWithBranding({ currentUser }: HeaderWithBrandingProps) {
  const userRole = localStorage.getItem("userRole");
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
        padding: "24px 40px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.3)",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: -30,
          right: 100,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.2)",
        }}
      ></div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Branding Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "12px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}
          >
            <img
              src={logo}
              alt="Sharda Associates Logo"
              style={{
                height: 60,
                width: "auto",
                display: "block",
              }}
            />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: "700",
                color: "#1a365d",
                letterSpacing: "-0.5px",
              }}
            >
              Sharda Associates
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "1rem",
                color: "#4a5568",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#48bb78",
                }}
              ></span>
              FCA - Franchises Compliance Automation
            </p>
          </div>
        </div>

        {/* User Welcome Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              textAlign: "right",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#2d3748",
              }}
            >
              Welcome back, {currentUser.name}!
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "1rem",
                color: "#718096",
                fontWeight: "500",
              }}
            >
              {currentUser.role || "Account Manager"}
            </p>
          </div>

          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: currentUser.avatar
                ? `url(${currentUser.avatar}) center/cover`
                : "#4299e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              border: "2px solid white",
            }}
          >
            {!currentUser.avatar && currentUser.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "12px",
        }}
      >
        <div
          style={{
            padding: "6px 12px",
            background: "rgba(255, 255, 255, 0.7)",
            borderRadius: "20px",
            fontSize: "1rem",
            fontWeight: "500",
            color: "#4a5568",
            backdropFilter: "blur(5px)",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          Last updated: {new Date().toLocaleDateString()}
        </div>
        <div
          style={{
            padding: "6px 12px",
            background: "rgba(255, 255, 255, 0.7)",
            borderRadius: "20px",
            fontSize: "1rem",
            fontWeight: "500",
            color: "#4a5568",
            backdropFilter: "blur(5px)",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          Role: <span style={{ color: "#38a169" }}>{userRole}</span>
        </div>
      </div>
    </div>
  );
}

export default HeaderWithBranding;
