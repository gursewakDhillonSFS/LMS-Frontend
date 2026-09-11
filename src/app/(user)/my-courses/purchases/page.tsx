"use client";

import React from "react";
import Membership from "@/modules/userSetting/Membership";
import Link from "next/link";
import { RoutePaths } from "@/utils/enums";

export default function PurchasesPage() {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href={RoutePaths.MyCourses} className="text-indigo-600 hover:underline">
          My Courses
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Purchase History & Receipts</span>
      </div>

      <Membership />
    </div>
  );
}
