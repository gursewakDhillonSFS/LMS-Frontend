"use client";
import React from "react";
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
import { RootState } from "@/redux/store";
import { setActiveCategory } from "@/redux/slices/CategoriesSlice";
import { useRouter } from "next/navigation";
import { RoutePaths } from "@/utils/enums";
import { UpOutlined, YoutubeFilled } from "@ant-design/icons";
import { setSignup, setSignupRole } from "@/redux/slices/AuthModalSlice";
import { useTranslation } from "@/context/I18nContext";
import LanguageSwitcher from "./LanguageSwitcher";

type FooterItem = {
  text: string;
  link?: string;
  icon?: React.ReactNode;
  action?: () => void;
};

const defaultCategories = [
  { name: "Data Science", id: "data-science" },
  { name: "Digital Marketing", id: "digital-marketing" },
  { name: "Mobile Development", id: "mobile-development" },
  { name: "UI/UX Design", id: "ui-ux-design" },
  { name: "Web Development", id: "web-development" },
];

const contactInfo = [
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
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const handleClickCategory = (id?: string) => {
    if (id) {
      dispatch(setActiveCategory(id));
    }
    router.push(RoutePaths?.Browse);
  };

  const handleBecomeInstructor = () => {
    dispatch(setSignupRole("instructor"));
    dispatch(setSignup(true));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayCategories =
    categories && categories.length > 0
      ? categories.slice(0, 5)
      : defaultCategories.map((c) => ({
          category_id: c.id,
          category_name: c.name,
        }));

  return (
    <footer className="bg-[#090D1A] text-white pt-12 pb-6 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Main 4 Balanced Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-8 border-b border-slate-800/80">
          {/* Brand Column (Span 4) */}
          <div className="lg:col-span-4 flex flex-col items-start gap-3">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <HeaderLogoIcon textColor="#ffffff" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {t("common.brand.tagline")}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2.5 mt-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 border border-slate-700/60 hover:bg-[#4F46E5] hover:border-[#4F46E5] transition-all cursor-pointer text-slate-300 hover:text-white">
                <FaceBookIcon />
              </span>
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 border border-slate-700/60 hover:bg-[#4F46E5] hover:border-[#4F46E5] transition-all cursor-pointer text-slate-300 hover:text-white">
                <LinkdinIcon />
              </span>
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 border border-slate-700/60 hover:bg-[#4F46E5] hover:border-[#4F46E5] transition-all cursor-pointer text-slate-300 hover:text-white">
                <TwitterIcon />
              </span>
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 border border-slate-700/60 hover:bg-[#4F46E5] hover:border-[#4F46E5] transition-all cursor-pointer text-slate-300 hover:text-white text-sm">
                <YoutubeFilled />
              </span>
            </div>
          </div>

          {/* Categories Column (Span 3) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="font-bold text-xs text-slate-300 tracking-wider uppercase">
              {t("common.footer.categories")}
            </h4>
            <ul className="flex flex-col gap-2">
              {displayCategories.map((item) => (
                <li
                  key={item.category_id}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
                  onClick={() => handleClickCategory(item.category_id)}
                >
                  {item.category_name}
                </li>
              ))}
            </ul>
          </div>

          {/* Helpful Links Column (Span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4 className="font-bold text-xs text-slate-300 tracking-wider uppercase">
              {t("common.footer.helpfulLinks")}
            </h4>
            <ul className="flex flex-col gap-2">
              <li
                className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
                onClick={handleBecomeInstructor}
              >
                Become an Instructor
              </li>
              <li
                className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
                onClick={() => router.push("/privacy-policy")}
              >
                {t("common.footer.privacy")}
              </li>
              <li
                className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
                onClick={() => router.push("/terms")}
              >
                {t("common.footer.terms")}
              </li>
            </ul>
          </div>

          {/* Contact Info Column (Span 3) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="font-bold text-xs text-slate-300 tracking-wider uppercase">
              {t("common.footer.contactUs")}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {contactInfo.map((contact) => (
                <li
                  key={contact.text}
                  className="flex items-start gap-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span className="mt-0.5 shrink-0 opacity-70">{contact.icon}</span>
                  <a href={contact.link} className="hover:underline break-words">
                    {contact.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright, Language Switcher & Scroll To Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            {t("common.footer.copyright")}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="footer" />
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="shrink-0 w-8 h-8 rounded-full bg-slate-800 hover:bg-[#4F46E5] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <UpOutlined className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
