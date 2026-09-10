"use client";
import CertificateCard from "@/components/CertificateCard";
import TabSwitcher from "@/components/TabSwitcher";
import { getMyCertificatesApi } from "@/services/collections";
import { badgeSections, CertificateTabSwitcher } from "@/utils/constant";
import { CertificateTabEnum } from "@/utils/enums";
import { LockImage } from "@/utils/images";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface CertItem {
  certificate_id: string;
  course_name: string;
  certificate_code: string;
  issued_at: string;
}

const MyCertificate = () => {
  const [activeTab, setActiveTab] = useState<string>(
    CertificateTabEnum?.CERTIFICATES
  );
  const [certs, setCerts] = useState<CertItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyCertificatesApi();
        if (res?.status) setCerts(res.data || []);
      } catch {
        setCerts([]);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
        Certificates & Badges
      </h1>
      <TabSwitcher
        activeKey={activeTab}
        onChange={setActiveTab}
        tabs={CertificateTabSwitcher}
      />
      {CertificateTabEnum?.CERTIFICATES === activeTab && (
        <div className="flex flex-col gap-4">
          <h2 className="text-[18px] font-bold text-[var(--text-primary)] tracking-tight">
            Earned Certificates
          </h2>
          {certs.length === 0 ? (
            <div className="bg-white border border-[var(--border)] rounded-[10px] p-8 text-center text-sm text-[var(--text-muted)] shadow-xs">
              No certificates yet. Complete all lessons and assignments in a course to earn your verified certificate.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {certs.map((item) => (
                <CertificateCard
                  key={item.certificate_id}
                  title={item.course_name}
                  code={item.certificate_code}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {CertificateTabEnum?.BADGES === activeTab && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-[18px] font-bold text-[var(--text-primary)] tracking-tight">
              Milestone Badges
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Unlock prestigious badges as you complete courses, score on quizzes, and reach learning milestones.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badgeSections.map((section) => (
              <div
                key={section.title}
                className="bg-white border border-[var(--border)] rounded-[10px] p-5 flex flex-col items-center gap-3 shadow-2xs hover:border-[var(--primary)] transition-colors text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center">
                  <Image src={LockImage} alt="locked" width={28} height={28} />
                </div>
                <p className="font-semibold text-xs text-[var(--text-primary)]">
                  {section.title.replace(/^[^A-Za-z0-9]+/, "")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCertificate;
