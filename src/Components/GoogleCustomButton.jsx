// src/components/GoogleCustomButton.jsx
import { FaGoogle } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";
import { auth } from "../lib/api";

export default function GoogleCustomButton({ onDone, onNeedsCompletion }) {
  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      try {
        const { user, profile_complete } = await auth.googleCode(code);
        if (!profile_complete && onNeedsCompletion) {
          // Profile incomplete — trigger completion flow instead of going to /account
          onNeedsCompletion(user);
        } else {
          onDone?.(user);
        }
      } catch (e) {
        console.error(e);
        alert(e?.error || "Google auth failed");
      }
    },
    onError: () => alert("Google auth error"),
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      className="h-11 w-full rounded-[12px] bg-[#F4F4F5] font-semibold
                 flex items-center justify-center gap-2 text-[#18181B]"
    >
      <FaGoogle />
      Google
    </button>
  );
}
