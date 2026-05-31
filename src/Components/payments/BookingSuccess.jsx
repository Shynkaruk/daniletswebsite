// src/pages/BookingSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/checkout-session/${sessionId}`);
        const data = await res.json();

        setSessionData(data.session || null);

        if (data.session?.payment_status === "paid") {
          setPaid(true);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch Stripe session:", err);
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center text-xl">
        Checking payment...
      </div>
    );
  }

  if (!paid) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-3xl font-bold text-red-600">Payment not completed</h2>
        <p className="text-gray-600">
          Your booking was not confirmed. If this is an error, please try again.
        </p>

        <button
          onClick={() => navigate("/book-online")}
          className="px-6 py-3 rounded-full bg-black text-white"
        >
          Back to booking
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-bold text-green-600">Payment successful!</h2>

      <p className="mt-3 text-gray-700 max-w-md">
        Thank you! Your booking deposit is confirmed.  
        Our team will contact you shortly to finalize the details.
      </p>

      {sessionData && (
        <div className="mt-6 bg-white shadow p-5 rounded-xl w-full max-w-md text-left">
          <h3 className="font-semibold mb-2">Payment details:</h3>

          <p><strong>Email:</strong> {sessionData.customer_email}</p>
          <p>
            <strong>Amount paid:</strong>{" "}
            {(sessionData.amount_total / 100).toFixed(2)}{" "}
            {sessionData.currency?.toUpperCase()}
          </p>
          <p><strong>Payment status:</strong> {sessionData.payment_status}</p>
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="mt-8 px-6 py-3 rounded-full bg-black text-white"
      >
        Go to Home
      </button>
    </div>
  );
};

export default BookingSuccess;
