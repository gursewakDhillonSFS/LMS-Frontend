"use client";

import React, { useEffect, useState } from "react";
import CommonButton from "@/components/CommonButton";
import {
  createTeacherConnectApi,
  getTeacherConnectStatusApi,
  getTeacherEarningsApi,
} from "@/services/collections";
import { toast } from "@/utils/toast";
import {
  BankOutlined,
  DollarCircleOutlined,
  CheckCircleFilled,
  WarningFilled,
  SyncOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Table, Tag } from "antd";

export default function TeacherEarningsPage() {
  const [connectLoading, setConnectLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectStatus, setConnectStatus] = useState<{
    connected: boolean;
    connect_status: string;
  }>({
    connected: false,
    connect_status: "pending",
  });
  const [earningsData, setEarningsData] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, earningsRes] = await Promise.all([
        getTeacherConnectStatusApi(),
        getTeacherEarningsApi(),
      ]);

      if (statusRes?.status && statusRes.data) {
        setConnectStatus(statusRes.data);
      }
      if (earningsRes?.status && earningsRes.data) {
        setEarningsData(earningsRes.data);
      }
    } catch (err) {
      console.error("Failed to load teacher earnings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnectStripe = async () => {
    try {
      setConnectLoading(true);
      const res = await createTeacherConnectApi();
      if (res?.status && res.data?.onboarding_url) {
        window.location.href = res.data.onboarding_url;
      } else {
        toast.error(res?.message || "Failed to generate Stripe onboarding link");
      }
    } catch (err: any) {
      console.error("Stripe connect error", err);
      toast.error(err?.response?.data?.message || "Could not connect Stripe");
    } finally {
      setConnectLoading(false);
    }
  };

  const summary = earningsData?.summary || {
    totalEarningsCents: 0,
    totalAvailableCents: 0,
    totalPaidCents: 0,
    totalItems: 0,
  };

  const columns = [
    {
      title: "Course Taught",
      dataIndex: "courseId",
      key: "course",
      render: (course: any) => (
        <div className="flex items-center gap-2">
          <BookOutlined className="text-indigo-600" />
          <span className="font-semibold text-slate-800 text-sm">
            {course?.course_name || "Course Session"}
          </span>
        </div>
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
      title: "Teacher Share Earned",
      dataIndex: "earningCents",
      key: "earning",
      render: (cents: number) => (
        <span className="font-bold text-emerald-600 text-sm">
          +${((cents || 0) / 100).toFixed(2)} USD
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === "paid") return <Tag color="success">Paid Out</Tag>;
        if (status === "available") return <Tag color="cyan">Available</Tag>;
        if (status === "processing") return <Tag color="processing">Processing</Tag>;
        return <Tag color="default">{status}</Tag>;
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Teacher Earnings & Payouts
        </h1>
        <p className="text-sm text-slate-500">
          Monitor your course batch earnings and manage your direct Stripe payout account.
        </p>
      </div>

      {/* Stripe Connect Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-2xl shrink-0">
            <BankOutlined />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-white">
                Stripe Direct Payouts
              </h3>
              {connectStatus.connected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  <CheckCircleFilled /> Payouts Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  <WarningFilled /> Setup Bank Account
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Connect your bank account or debit card via Stripe Connect to receive your teacher revenue share automatically whenever students enroll in your batches.
            </p>
          </div>
        </div>

        <CommonButton
          text={
            connectLoading
              ? "Connecting..."
              : connectStatus.connected
              ? "Manage Stripe Account"
              : "Connect Stripe"
          }
          loading={connectLoading}
          onClick={handleConnectStripe}
          className="!h-11 !px-6 !rounded-xl !bg-[#4F46E5] hover:!bg-[#4338CA] !text-white !font-bold text-xs shrink-0 shadow-md"
        />
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Revenue Share Earned
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1">
            ${((summary.totalEarningsCents || 0) / 100).toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            From {summary.totalItems || 0} student enrollments
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Available for Payout
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1">
            ${((summary.totalAvailableCents || summary.totalEarningsCents || 0) / 100).toFixed(2)}
          </span>
          <span className="text-xs text-emerald-600 font-medium">Ready for next transfer</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Paid Out
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1">
            ${((summary.totalPaidCents || 0) / 100).toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-medium">Sent to bank account</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Teaching Earnings History
          </h3>
          <button
            onClick={fetchData}
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
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{
            emptyText: (
              <div className="py-10 text-center text-slate-400 text-xs">
                No teaching earnings recorded yet. When students enroll in your assigned batches, your revenue share will appear here.
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
