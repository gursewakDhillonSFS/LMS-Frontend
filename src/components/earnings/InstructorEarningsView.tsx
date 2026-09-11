"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BankOutlined,
  DollarCircleOutlined,
  CheckCircleFilled,
  WarningFilled,
  SyncOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Table, Tag } from "antd";

import { RootState } from "@/redux/store";
import { createOrgConnectApi, getOrgConnectStatusApi, getOrgEarningsApi } from "@/services/collections";
import { toast } from "@/utils/toast";

export default function InstructorEarningsView() {
  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );

  const [connectLoading, setConnectLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [connectStatus, setConnectStatus] = useState<{
    connected: boolean;
    connect_status: string;
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
  }>({
    connected: false,
    connect_status: "pending",
  });
  const [earningsData, setEarningsData] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, earningsRes] = await Promise.all([
        getOrgConnectStatusApi(organization_id),
        getOrgEarningsApi(organization_id),
      ]);

      if (statusRes?.status && statusRes.data) {
        setConnectStatus(statusRes.data);
      }
      if (earningsRes?.status && earningsRes.data) {
        setEarningsData(earningsRes.data);
      }
    } catch (err) {
      console.error("Failed to load earnings info", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [organization_id]);

  const handleConnectStripe = async () => {
    try {
      setConnectLoading(true);
      const res: any = await createOrgConnectApi(
        organization_id ? { organisationId: organization_id } : undefined
      );

      const redirectUrl =
        res?.data?.url ||
        res?.data?.onboarding_url ||
        res?.onboarding_url ||
        res?.url;

      if (redirectUrl) {
        toast.success("Redirecting to Stripe Connect setup...");
        window.location.href = redirectUrl;
        return;
      }

      if (
        res?.data?.connect_status === "active" ||
        res?.message === "Stripe Connect already active"
      ) {
        toast.success("Stripe Connect account is already active!");
        fetchData();
        return;
      }

      toast.error(res?.message || "Failed to create Stripe Connect onboarding link");
    } catch (err: any) {
      console.error("Stripe connect error", err);
      toast.error(err?.response?.data?.message || "Could not connect to Stripe");
    } finally {
      setConnectLoading(false);
    }
  };

  const summary = earningsData?.summary || {
    totalGrossCents: 0,
    totalEarningsCents: 0,
    totalPlatformFeeCents: 0,
    totalPaidCents: 0,
    totalItems: 0,
  };

  const items = (earningsData?.items || []).filter((item: any) => {
    if (!search) return true;
    const name = item.courseId?.course_name || item.course_name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const columns = [
    {
      title: "Course",
      dataIndex: "courseId",
      key: "course",
      render: (course: any, record: any) => {
        const courseName = course?.course_name || record.course_name || "Course Enrollment";
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#315CFF]/10 text-[#315CFF] flex items-center justify-center text-base shrink-0 border border-[#315CFF]/20">
              <BookOutlined />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-sm block truncate">
                {courseName}
              </span>
              <span className="text-xs text-slate-400">
                Transaction ID: {record._id ? record._id.slice(-8) : "—"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (d: string) => (
        <span className="text-xs font-medium text-slate-600">
          {d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
        </span>
      ),
    },
    {
      title: "Gross Amount",
      dataIndex: "grossAmountCents",
      key: "gross",
      render: (cents: number, record: any) => {
        const amt = cents ? cents / 100 : record.gross_amount || 0;
        return <span className="font-semibold text-slate-800 text-sm">${amt.toFixed(2)}</span>;
      },
    },
    {
      title: "Platform Fee",
      dataIndex: "platformFeeCents",
      key: "fee",
      render: (cents: number, record: any) => {
        const fee = cents ? cents / 100 : record.platform_fee || 0;
        return <span className="text-xs text-slate-500 font-medium">-${fee.toFixed(2)}</span>;
      },
    },
    {
      title: "Net Org Share",
      dataIndex: "earningCents",
      key: "earning",
      render: (cents: number, record: any) => {
        const net = cents ? cents / 100 : record.earning || 0;
        return (
          <span className="font-bold text-emerald-600 text-sm">
            +${net.toFixed(2)} USD
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === "paid") return <Tag color="success">Transferred</Tag>;
        if (status === "available") return <Tag color="cyan">Available</Tag>;
        if (status === "processing") return <Tag color="processing">Processing</Tag>;
        return <Tag color="default">{status || "Completed"}</Tag>;
      },
    },
  ];

  const totalGross = (summary.totalGrossCents || (summary.total_gross ? summary.total_gross * 100 : 0)) / 100;
  const netEarnings = (summary.totalEarningsCents || (summary.total_earnings ? summary.total_earnings * 100 : 0)) / 100;
  const platformFees = (summary.totalPlatformFeeCents || (summary.total_platform_fees ? summary.total_platform_fees * 100 : 0)) / 100;

  return (
    <div className="space-y-6">
      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Gross Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Gross Course Sales
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#101828]">
              {loading ? "..." : `$${totalGross.toFixed(2)}`}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-[#315CFF] font-medium">
              <ArrowUpOutlined className="text-[10px]" />
              <span>{summary.totalItems || earningsData?.items?.length || 0} purchases</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#315CFF]/10 flex items-center justify-center text-[#315CFF] text-xl shrink-0">
            <DollarCircleOutlined />
          </div>
        </div>

        {/* Net Organization Share */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Net Organization Revenue
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {loading ? "..." : `$${netEarnings.toFixed(2)}`}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircleFilled className="text-[10px]" />
              <span>Available for payout</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl shrink-0">
            <SafetyCertificateOutlined />
          </div>
        </div>

        {/* Platform Fees */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Platform & Stripe Fees
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#101828]">
              {loading ? "..." : `$${platformFees.toFixed(2)}`}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Standard 5% processing</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 text-xl shrink-0">
            <BankOutlined />
          </div>
        </div>

        {/* Payout Account Status */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Stripe Direct Payouts
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-[#101828]">
              {connectStatus.connected ? "Active" : "Setup Required"}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {connectStatus.connected ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircleFilled className="text-[10px]" /> Bank Linked
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1">
                  <WarningFilled className="text-[10px]" /> Action Needed
                </span>
              )}
            </div>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              connectStatus.connected
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            <BankOutlined />
          </div>
        </div>
      </div>

      {/* STRIPE CONNECT HERO CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101828] via-[#1D2939] to-[#0B132B] p-6 sm:p-7 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-2xl shrink-0 border border-white/15">
              <BankOutlined />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Stripe Express Payout Account
                </h3>
                {connectStatus.connected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                    <CheckCircleFilled /> Direct Deposits Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                    <WarningFilled /> Setup Bank Account
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect your organization's bank account via Stripe Connect to automatically receive course sales revenue. Course earnings are automatically split with assigned teachers based on configured revenue share percentages.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={connectLoading}
            onClick={handleConnectStripe}
            className="px-6 py-3 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connectLoading
              ? "Connecting..."
              : connectStatus.connected
              ? "Manage Stripe Account"
              : "Connect Stripe"}
          </button>
        </div>
      </div>

      {/* REVENUE BREAKDOWN & TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#F2F4F7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#101828]">Earnings History</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F2F4F7] text-[#475467]">
              {items.length} transactions
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search by course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-[#E4E7EC] rounded-xl text-[#101828] placeholder-slate-400 focus:outline-none focus:border-[#315CFF] focus:ring-2 focus:ring-[#315CFF]/10 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="p-2.5 text-slate-500 hover:text-[#315CFF] hover:bg-[#315CFF]/10 rounded-xl transition-colors border border-[#E4E7EC] cursor-pointer"
              title="Refresh Earnings Data"
            >
              <SyncOutlined className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={items}
            rowKey={(r: any) => r._id || r.courseId || Math.random().toString()}
            loading={loading}
            pagination={{ pageSize: 8 }}
            locale={{
              emptyText: (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No transaction records found. When students purchase your paid courses, revenue details will appear here.
                </div>
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}
