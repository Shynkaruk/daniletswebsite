// src/components/payments/WhopDeposit.jsx
import React from "react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";

const WhopDeposit = ({ planId, email, onComplete }) => {
  return (
    <div className="w-full mt-4 bg-white/90 rounded-2xl p-4 shadow-inner">
      <WhopCheckoutEmbed
        fallback={<>Loading secure checkout…</>}
        planId={planId}
        theme="light"
        hidePrice={false}
        prefill={email ? { email } : undefined}
        skipRedirect
        onComplete={(paidPlanId, receiptId) => {
          console.log("Whop paid:", paidPlanId, receiptId);
          if (onComplete) {
            onComplete({ planId: paidPlanId, receiptId });
          }
        }}
      />
    </div>
  );
};

export default WhopDeposit;
