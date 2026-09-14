"use client";

import React, { useEffect, useState } from "react";
import CommonButton from "@/components/CommonButton";
import {
  createOrgConnectApi,
  getOrgConnectStatusApi,
  getOrgEarningsApi,
  getOrgDashboardLinkApi,
} from "@/services/collections";
import { toast } from "@/utils/toast";
import {
  BankOutlined,
  DollarCircleOutlined,
  CheckCircleFilled,
  WarningFilled,
  SyncOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { Table, Tag } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const OrganisationPayments: React.FC = () => {
  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );
  const [connectLoading, setConnectLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
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

  const fetchStatus = async () => {
    try {
      setStatusLoading(true);
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
      console.error("Failed to load connect status", err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [organization_id]);

  const handleRefreshStatus = async () => {
    try {
      setRefreshing(true);
      const [statusRes, earningsRes] = await Promise.all([
        getOrgConnectStatusApi(organization_id),
        getOrgEarningsApi(organization_id),
      ]);

      if (statusRes?.status && statusRes.data) {
        setConnectStatus(statusRes.data);
        if (statusRes.data.connected) {
          toast.success("Stripe Connect status refreshed: Direct Deposits Active");
        } else {
          toast.info("Stripe Connect status refreshed: Setup Required");
        }
      } else {
        toast.info("Stripe Connect status refreshed");
      }

      if (earningsRes?.status && earningsRes.data) {
        setEarningsData(earningsRes.data);
      }
    } catch (err) {
      console.error("Failed to refresh Stripe status", err);
      toast.error("Failed to refresh Stripe Connect status");
    } finally {
      setRefreshing(false);
    }
  };

  const handleManageStripeAccount = async () => {
    try {
      setDashboardLoading(true);
      const res: any = await getOrgDashboardLinkApi(
        organization_id ? { organisationId: organization_id } : undefined
      );

      const redirectUrl =
        res?.url ||
        res?.data?.url ||
        res?.data?.onboarding_url ||
        res?.onboarding_url;

      if (redirectUrl) {
        toast.success("Opening Stripe Express Dashboard...");
        window.open(redirectUrl, "_blank", "noopener,noreferrer");
        return;
      }

      await handleConnectStripe();
    } catch (err: any) {
      console.error("Failed to open Stripe dashboard", err);
      toast.error(
        err?.response?.data?.message || "Could not open Stripe Express dashboard"
      );
    } finally {
      setDashboardLoading(false);
    }
  };

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
        toast.success("Opening Stripe setup...");
        window.open(redirectUrl, "_blank", "noopener,noreferrer");
        return;
      }

      if (
        res?.data?.connect_status === "active" ||
        res?.message === "Stripe Connect already active"
      ) {
        toast.success("Stripe Connect account is already active!");
        fetchStatus();
        return;
      }

      toast.error(
        res?.message || "Failed to create Stripe Connect onboarding link"
      );
    } catch (err: any) {
      console.error("Stripe connect error", err);
      toast.error(err?.response?.data?.message || "Could not connect to Stripe");
    } finally {
      setConnectLoading(false);
    }
  };

  const summary = earningsData?.summary || {
    totalGrossCents: 0,
    totalPlatformFeeCents: 0,
    totalEarningsCents: 0,
    totalItems: 0,
  };

  const columns = [
    {
      title: "Course",
      dataIndex: "courseId",
      key: "course",
      render: (course: any) => (
        <span className="font-semibold text-slate-800 text-sm">
          {course?.course_name || "Course Sale"}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (d: string) => (
        <span className="text-xs text-slate-500">
          {d ? new Date(d).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      title: "Gross Price",
      dataIndex: "grossAmountCents",
      key: "gross",
      render: (cents: number) => (
        <span className="text-sm font-medium text-slate-700">
          ${((cents || 0) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Platform Fee (5%)",
      dataIndex: "platformFeeCents",
      key: "fee",
      render: (cents: number) => (
        <span className="text-xs text-slate-500">
          -${((cents || 0) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Org Net Share",
      dataIndex: "earningCents",
      key: "earning",
      render: (cents: number) => (
        <span className="font-bold text-emerald-600 text-sm">
          +${((cents || 0) / 100).toFixed(2)} USD
        </span>
      ),
    },
    {
      title: "Payout Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === "paid") return <Tag color="success">Paid Out</Tag>;
        if (status === "processing") return <Tag color="processing">Processing</Tag>;
        if (status === "available") return <Tag color="cyan">Available</Tag>;
        return <Tag color="default">{status}</Tag>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Stripe Connect Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-2xl shrink-0">
            <BankOutlined />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-white">
                Stripe Connect Payouts
              </h3>
              {connectStatus.connected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  <CheckCircleFilled /> Active & Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  <WarningFilled /> Setup Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Link your organization bank account via Stripe Connect to receive automatic transfers from course sales after the 5% platform fee.
            </p>
          </div>
        </div>

        {/* Actions: Refresh & Manage/Connect Stripe */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            disabled={refreshing}
            onClick={handleRefreshStatus}
            className="flex items-center gap-2 px-4 h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Stripe Connect status"
          >
            <SyncOutlined spin={refreshing} />
            <span>{refreshing ? "Refreshing..." : "Refresh Status"}</span>
          </button>

          {connectStatus.connected ? (
            <button
              type="button"
              disabled={dashboardLoading}
              onClick={handleManageStripeAccount}
              className="flex items-center gap-2 px-5 h-11 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Open Stripe Express Dashboard"
            >
              <BankOutlined />
              <span>{dashboardLoading ? "Opening Dashboard..." : "Manage Stripe Account"}</span>
              <ExportOutlined className="text-xs ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={connectLoading}
              onClick={handleConnectStripe}
              className="flex items-center gap-2 px-5 h-11 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BankOutlined />
              <span>{connectLoading ? "Connecting..." : "Connect Stripe"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Sales Revenue
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1">
            ${((summary.totalGrossCents || 0) / 100).toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {summary.totalItems || 0} courses sold
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Platform Fees Paid (5%)
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1">
            ${((summary.totalPlatformFeeCents || 0) / 100).toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-medium">Platform processing fee</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Organisation Earnings
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1">
            ${((summary.totalEarningsCents || 0) / 100).toFixed(2)}
          </span>
          <span className="text-xs text-emerald-600 font-medium">Available for transfer</span>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Course Sales & Earnings Breakdown
          </h3>
          <button
            onClick={fetchStatus}
            className="flex items-center gap-1.5 text-xs text-[#4F46E5] hover:underline font-semibold cursor-pointer"
          >
            <SyncOutlined />
            <span>Refresh</span>
          </button>
        </div>

        <Table
          columns={columns}
          dataSource={earningsData?.items || []}
          rowKey="_id"
          loading={statusLoading}
          pagination={{ pageSize: 8 }}
          locale={{
            emptyText: (
              <div className="py-10 text-center text-slate-400 text-xs">
                No course sales recorded yet. Once students purchase your courses, their payments and splits will appear here.
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
};

export default OrganisationPayments;
