"use client";
import React from "react";
import CommonButton from "./CommonButton";
import {
  EnvelopeIcon,
  FaceBookIcon,
  HeaderLogoIcon,
  LinkdinIcon,
  LocationIcon,
  PhoneCallIcon,
  TwitterIcon,
} from "@/utils/icons";
import { useDispatch, useSelector } from "react-redux";
import { setSignup } from "@/redux/slices/AuthModalSlice";
import { RootState } from "@/redux/store";
import { setActiveCategory } from "@/redux/slices/CategoriesSlice";
import { useRouter } from "next/navigation";
import { RoutePaths } from "@/utils/enums";
type FooterItem = {
  text: string;
  link?: string;
  icon?: React.ReactNode;
};

type FooterSection = {
  title: string;
  items: FooterItem[];
};

const helpfulLinks: FooterSection = {
  title: "Helpful links",
  items: [
    { text: "Become a Instructor", link: RoutePaths?.BecomeInstructor },
    { text: "Privacy Policy", link: "/privacy-policy" },
    { text: "Terms & Condition", link: "/terms" },
  ],
};

const contactInfo: FooterItem[] = [
  {
    text: "(252) 555-0126",
    icon: <PhoneCallIcon />,
    link: "tel:2525550126",
  },
  {
    text: "georgia.young@example.com",
    icon: <EnvelopeIcon />,
    link: "mailto:georgia.young@example.com",
  },
  {
    text: "3891 Ranchview Dr. Richardson, California 62639",
    icon: <LocationIcon />,
    link: "https://maps.google.com/?q=3891+Ranchview+Dr+Richardson+California+62639",
  },
];

const Footer: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const handleClick = (id: string) => {
    dispatch(setActiveCategory(id));
    router.push(RoutePaths?.Browse);
  };

  const handleSignup = () => {
    dispatch(setSignup(true));
  };
  return (
    <footer className="flex flex-col gap-[48px] xl:gap-[64px] justify-between bg-[var(--text-primary)] text-white px-[24px] xl:px-[80px] 2xl:px-[120px] pt-[48px] xl:pt-[64px] pb-[40px]">
      <div className="flex flex-col items-center justify-center gap-[24px]">
        <h2 className="text-[28px] lg:text-[32px] font-[600] text-center leading-[130%]">
          What will learning do for your <br />personal life?
        </h2>
        <div className="flex gap-3">
          <CommonButton
            text={"Sign Up for Free"}
            bgColor="#FFFFFF"
            className="!text-[var(--text-primary)] !h-[40px] !text-[14px] hover:!opacity-90"
            onClick={handleSignup}
          />
          <CommonButton
            text={"Start 7-day Free Trial"}
            className="!bg-[var(--primary)] !text-white !h-[40px] !text-[14px]"
            onClick={() => router.push(RoutePaths?.Subscription)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[48px]">
        <div className="grid grid-cols-2 gap-[24px] lg:gap-[40px] lg:grid-cols-4">
          <div className="flex flex-col gap-[16px] col-span-2">
            <h4 className="font-[600] text-[15px] text-white/60 uppercase tracking-[0.05em]">Categories</h4>
            <div className="grid grid-cols-2 gap-[12px]">
              {categories?.map((item) => (
                <span
                  key={item?.category_id}
                  className="text-[14px] text-white/80 hover:text-white cursor-pointer transition-colors duration-[150ms]"
                  onClick={() => handleClick(item?.category_id)}
                >
                  {item?.category_name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <h4 className="font-[600] text-[15px] text-white/60 uppercase tracking-[0.05em]">{helpfulLinks.title}</h4>
            <ul className="flex flex-col gap-[12px]">
              {helpfulLinks.items.map((item) => (
                <li
                  key={item?.text}
                  className="text-[14px] text-white/80 hover:text-white cursor-pointer transition-colors duration-[150ms]"
                  onClick={() => {
                    if (item?.link) router.push(item?.link);
                  }}
                >
                  {item?.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-[16px]">
            <h4 className="font-[600] text-[15px] text-white/60 uppercase tracking-[0.05em]">Contact Info</h4>
            <ul className="flex flex-col gap-[12px]">
              {contactInfo.map((contact) => (
                <li
                  key={contact?.text}
                  className="flex items-start gap-[8px] text-[14px] text-white/80"
                >
                  <span className="mt-[2px] opacity-60">{contact.icon}</span>
                  <span>{contact.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-[24px] flex flex-col md:flex-row justify-between items-center gap-[16px]">
          <HeaderLogoIcon textColor="#ffffff" />
          <div className="text-[13px] text-white/50">
            © 2025 Learning+. All Rights Reserved.
          </div>
          <div className="flex gap-[12px]">
            <span className="w-[36px] h-[36px] flex items-center justify-center rounded-full border border-white/20 hover:border-white/40 cursor-pointer transition-colors duration-[150ms]">
              <FaceBookIcon />
            </span>
            <span className="w-[36px] h-[36px] flex items-center justify-center rounded-full border border-white/20 hover:border-white/40 cursor-pointer transition-colors duration-[150ms]">
              <LinkdinIcon />
            </span>
            <span className="w-[36px] h-[36px] flex items-center justify-center rounded-full border border-white/20 hover:border-white/40 cursor-pointer transition-colors duration-[150ms]">
              <TwitterIcon />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
