// src/Components/AuthCallback.jsx
// Handles the redirect from Apple (and any other OAuth) with ?token=...
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken, setUser } from "../lib/api";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      console.error("OAuth callback error:", error);
      // Redirect to home with error indicator
      navigate("/?auth_error=" + encodeURIComponent(error), { replace: true });
      return;
    }

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    // Decode the JWT payload to get user info (no verification needed — server already signed it)
    let profileComplete = true; // default: assume complete unless told otherwise
    const profileCompleteParam = params.get("profile_complete");
    if (profileCompleteParam !== null) {
      profileComplete = profileCompleteParam === "1";
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const user = {
        id: payload.uid,
        email: payload.email,
        is_admin: !!payload.is_admin,
        // first_name / last_name / phone are not in JWT payload by default;
        // they will be fetched on the next /api/me/profile call
      };

      setToken(token);
      setUser(user);
    } catch (e) {
      console.error("Failed to decode JWT:", e);
      // Still save the token even if decode fails
      setToken(token);
    }

    if (!profileComplete) {
      // Apple user needs to complete their profile — Layout will detect this param
      navigate("/?need_profile=1", { replace: true });
    } else {
      navigate("/account", { replace: true });
    }
  }, [navigate]);

  return null; // blank screen while redirecting
}
