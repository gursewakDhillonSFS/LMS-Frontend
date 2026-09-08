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
    <div className="flex flex-col gap-4">
      <h1 className="text-[32px] font-[700] text-[#0E0E0E]">
        Certificate & Badges
      </h1>
      <TabSwitcher
        activeKey={activeTab}
        onChange={setActiveTab}
        tabs={CertificateTabSwitcher}
      />
      {CertificateTabEnum?.CERTIFICATES === activeTab && (
        <div className="flex flex-col gap-3">
          <h1 className="text-[24px] font-[700] text-[#0E0E0E]">Certificate</h1>
          {certs.length === 0 ? (
            <p className="text-slate-500">
              No certificates yet. Complete a course to earn one.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
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
        <div className="flex flex-col gap-3">
          <h1 className="text-[24px] font-[700] text-[#0E0E0E]">
            My Achievements
          </h1>
          <p className="text-[#0E0E0E]">
            Unlock badges as you complete courses and milestones.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {badgeSections.map((section) => (
              <div
                key={section.title}
                className="bg-white rounded-xl p-4 flex flex-col items-center gap-2"
              >
                <Image src={LockImage} alt="locked" width={48} height={48} />
                <p className="font-semibold text-sm text-center">
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
