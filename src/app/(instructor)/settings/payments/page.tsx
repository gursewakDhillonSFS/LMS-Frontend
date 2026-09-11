"use client";

import React from "react";
import OrganisationPayments from "@/modules/userSetting/OrganisationPayments";

export default function InstructorPaymentsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Payments & Stripe Connect
        </h1>
        <p className="text-sm text-slate-500">
          Manage your organization payout account, view earnings, and monitor revenue share.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <OrganisationPayments />
      </div>
    </div>
  );
}
