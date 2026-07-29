"use client";

import { useState, useCallback } from "react";
import { CampaignWizardClient } from "@/components/campaign/campaign-wizard-client";
import { OtpVerificationGate } from "@/components/campaign/otp-verification";

export function ApplyPageClient() {
  const [verificationState, setVerificationState] = useState<{
    verified: boolean;
    token: string;
    email: string;
  }>({ verified: false, token: "", email: "" });

  const handleVerified = useCallback((token: string, email: string) => {
    setVerificationState({ verified: true, token, email });
    // Store verification token in sessionStorage for later form submission
    try {
      sessionStorage.setItem("campaign_verification_token", token);
      sessionStorage.setItem("campaign_verified_email", email);
    } catch {}
  }, []);

  if (!verificationState.verified) {
    return <OtpVerificationGate onVerified={handleVerified} />;
  }

  return (
    <CampaignWizardClient
      verificationToken={verificationState.token}
      verifiedEmail={verificationState.email}
    />
  );
}
