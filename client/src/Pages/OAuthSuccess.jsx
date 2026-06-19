import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { ENDPOINTS, saveSession } from "@/lib/api";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate("/auth", { replace: true });
      return;
    }

    try {
      // Store token only first; ProtectedRoute also expects readnest_user.
      localStorage.setItem("readnest_token", token);
    } catch {
      setError("Failed to store session token");
      return;
    }

    (async () => {
      try {
        const payload = await api.get(ENDPOINTS.USER.PROFILE);
        // payload: { message, user }
        saveSession({ token, user: payload.user });
        navigate("/overview", { replace: true });
      } catch (error) {
        setError(error?.message || "OAuth session validation failed");
        // If profile fetch fails, don't keep user on protected routes.
        navigate("/auth", { replace: true });
      }
    })();
  }, [navigate]);

  if (error) {
    return null;
  }

  return null;
};

export default OAuthSuccess;



