"use client";

import React, { useEffect, useState } from "react";
import CommonButton from "@/components/CommonButton";
import { getAdminEarningsApi, refundPurchaseApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import {
  DollarCircleOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  RollbackOutlined,
  UserOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Table, Tag, Modal, Input } from "antd";
import Link from "next/link";

export default function AdminFinancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refundModal, setRefundModal] = useState<{ open: boolean; purchase: any | null }>({
    open: false,
    purchase: null,
  });
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const res = await getAdminEarningsApi();
      if (res?.status && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load admin finance", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleRefund = async () => {
    if (!refundModal.purchase) return;
    try {
      setRefundLoading(true);
      const res = await refundPurchaseApi(refundModal.purchase._id, {
        reason: refundReason || "Admin authorized refund",
      });
      if (res?.status) {
        toast.success("Purchase successfully refunded");
        setRefundModal({ open: false, purchase: null });
        setRefundReason("");
        fetchFinance();
      } else {
        toast.error(res?.message || "Refund failed");
      }
    } catch (err: any) {
      console.error("Refund error", err);
      toast.error(err?.response?.data?.message || "Error processing refund");
    } finally {
      setRefundLoading(false);
    }
  };

  const summary = data?.summary || {
    totalGrossCents: 0,
    totalPlatformFeeCents: 0,
    totalOrgShareCents: 0,
    totalTeacherShareCents: 0,
    totalPurchases: 0,
  };

  const columns = [
    {
      title: "Course",
      dataIndex: "courseId",
      key: "course",
      render: (course: any) => (
        <span className="font-semibold text-slate-900 text-sm">
          {course?.course_name || "Course Purchase"}
        </span>
      ),
    },
    {
      title: "Student",
      dataIndex: "studentId",
      key: "student",
      render: (student: any) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-800">{student?.full_name || "Student"}</span>
          <span className="text-slate-400">{student?.email || "—"}</span>
        </div>
      ),
    },
    {
      title: "Gross",
      dataIndex: "grossAmountCents",
      key: "gross",
      render: (cents: number) => (
        <span className="font-bold text-slate-900 text-sm">
          ${((cents || 0) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Platform Fee (5%)",
      dataIndex: "platformFeeCents",
      key: "platformFee",
      render: (cents: number) => (
        <span className="font-bold text-indigo-600 text-sm">
          +${((cents || 0) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Org Share",
      dataIndex: "organisationShareCents",
      key: "orgShare",
      render: (cents: number) => (
        <span className="text-xs text-slate-700 font-medium">
          ${((cents || 0) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Teacher Share",
      dataIndex: "teacherShareCents",
      key: "teacherShare",
      render: (cents: number) => (
        <span className="text-xs text-slate-700 font-medium">
          ${((cents || 0) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === "paid") return <Tag color="success">Paid</Tag>;
        if (status === "refunded") return <Tag color="purple">Refunded</Tag>;
        return <Tag color="default">{status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        if (record.status === "paid") {
          return (
            <button
              onClick={() => setRefundModal({ open: true, purchase: record })}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              <RollbackOutlined />
              <span>Refund</span>
            </button>
          );
        }
        return <span className="text-xs text-slate-400">—</span>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-indigo-600 hover:underline">
              ← Back to Admin
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Platform Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Real-time monitoring of course purchases, 5% platform fees, and organization / teacher distributions.
          </p>
        </div>
        <button
          onClick={fetchFinance}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer w-fit shadow-xs"
        >
          <SyncOutlined />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Platform Fee Revenue (5%)
          </span>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
            ${((summary.totalPlatformFeeCents || 0) / 100).toFixed(2)}
          </p>
          <span className="text-xs text-slate-400">Net platform earnings</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gross Course Sales Volume
          </span>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
            ${((summary.totalGrossCents || 0) / 100).toFixed(2)}
          </p>
          <span className="text-xs text-slate-400">{summary.totalPurchases || 0} purchases completed</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Org Earnings Distributed
          </span>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
            ${((summary.totalOrgShareCents || 0) / 100).toFixed(2)}
          </p>
          <span className="text-xs text-slate-400">Paid to organizations</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Teacher Share Distributed
          </span>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
            ${((summary.totalTeacherShareCents || 0) / 100).toFixed(2)}
          </p>
          <span className="text-xs text-slate-400">Paid to course teachers</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Recent Purchases & Revenue Split Log
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {data?.recentPurchases?.length || 0} Transactions
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={data?.recentPurchases || []}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <div className="py-12 text-center text-slate-400 text-xs">
                No course transactions found in the platform database.
              </div>
            ),
          }}
        />
      </div>

      {/* Refund Modal */}
      {refundModal.open && (
        <Modal
          open={refundModal.open}
          onCancel={() => setRefundModal({ open: false, purchase: null })}
          footer={null}
          centered
          width={450}
        >
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-rose-600">
                Confirm Refund
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Refund Course Purchase
              </h3>
              <p className="text-xs text-slate-500">
                This will trigger a full refund via Stripe and reverse organization & teacher earnings allocations.
              </p>
            </div>

            {refundModal.purchase && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs flex flex-col gap-1 border border-slate-200/80">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Gross Refund Amount:</span>
                  <span>
                    ${((refundModal.purchase.grossAmountCents || 0) / 100).toFixed(2)} USD
                  </span>
                </div>
                <div className="text-slate-500">
                  Purchase ID: {refundModal.purchase._id}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">
                Reason for Refund (optional)
              </label>
              <Input
                placeholder="e.g. Student requested within 2-day policy"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <CommonButton
                text="Cancel"
                onClick={() => setRefundModal({ open: false, purchase: null })}
                className="!w-1/2 !h-10 !bg-slate-100 !text-slate-700 border-none font-semibold text-xs"
              />
              <CommonButton
                text={refundLoading ? "Processing..." : "Authorize Refund"}
                loading={refundLoading}
                onClick={handleRefund}
                className="!w-1/2 !h-10 !bg-rose-600 hover:!bg-rose-700 !text-white font-semibold text-xs"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
