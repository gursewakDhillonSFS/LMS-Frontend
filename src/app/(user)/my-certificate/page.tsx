"use client";
import CertificateCard from "@/components/CertificateCard";
import TabSwitcher from "@/components/TabSwitcher";
import { badgeSections, CertificateTabSwitcher } from "@/utils/constant";
import { CertificateTabEnum } from "@/utils/enums";
import { LockImage } from "@/utils/images";
import Image from "next/image";
import React, { useState } from "react";

const MyCertificate = () => {
  const [activeTab, setActiveTab] = useState<string>(
    CertificateTabEnum?.CERTIFICATES
  );

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
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <CertificateCard key={item} />
            ))}
          </div>
        </div>
      )}
      {CertificateTabEnum?.BADGES === activeTab && (
        <div className="flex flex-col gap-3">
          <h1 className="text-[24px] font-[700] text-[#0E0E0E]">
            My Achievements
          </h1>
          <p className="text-[#0E0E0E]">
            Explore your collection of badges earned for your commitment to
            health and fitness, track your growth, and discover how to earn
            more.
          </p>
          {badgeSections.map((section, idx) => (
            <BadgeCard
              key={idx}
              title={section.title}
              subtitle={section.subtitle}
              badges={section.badges}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificate;

export interface BadgeItem {
  title: string;
  icon: string;
}

export interface BadgeCardProps {
  title: string;
  subtitle: string;
  badges: BadgeItem[];
}

const BadgeCard: React.FC<BadgeCardProps> = ({ title, subtitle, badges }) => {
  return (
    <div className="bg-white rounded-[14px] p-5 flex flex-col gap-3">
      <h2 className="text-xl font-bold text-[#0E0E0E]">{title}</h2>
      <p className="text-sm text-[#0E0E0E] ">{subtitle}</p>
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
        {badges?.map((badge, index) => (
          <div
            key={index}
            className="flex flex-col items-center w-24 text-center"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center">
              <Image
                src={LockImage}
                alt={badge?.title}
                width={140}
                height={140}
                unoptimized
              />
            </div>
            <span className="text-[#0E0E0E] font-semibold whitespace-nowrap">
              {badge.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
