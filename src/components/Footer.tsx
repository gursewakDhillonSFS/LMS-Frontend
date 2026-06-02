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
    <footer className="flex flex-col gap-[49px] xl:gap-[89px] justify-between bg-black text-white px-[40px] xl:px-[170px] pt-[40px] xl:pt-[80px] pb-[50px]">
      <div className="flex flex-col items-center justify-center gap-[32px]">
        <h2 className="text-[36px] lg:text-[40px] font-[700] text-center leading-[120%]">
          What will learning do for your <br /> Personal Life?
        </h2>
        <div className="flex gap-3">
          <CommonButton
            text={"Sign Up for Free"}
            bgColor="#ffffff"
            className="!text-black px-[19px]"
            onClick={handleSignup}
          />
          <CommonButton
            text={"Start 7-day Free Trial"}
            className="!bg-secondary !text-white"
            onClick={() => router.push(RoutePaths?.Subscription)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[62px]">
        <div className="grid grid-cols-2 gap-[20px] lg:gap-0 lg:grid-cols-4 justify-center items-center">
          <div className="flex flex-col gap-[20px] col-span-2">
            <h4 className="font-[600] text-[18px] ">Categories</h4>
            <div className="grid grid-cols-2 gap-[20px]">
              {categories?.map((item) => (
                <span
                  key={item?.category_id}
                  className="text-sm hover:underline cursor-pointer"
                  onClick={() => handleClick(item?.category_id)}
                >
                  {item?.category_name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[20px]">
            <h4 className="font-[600] text-[18px]">{helpfulLinks.title}</h4>
            <ul className="flex flex-col gap-[20px]">
              {helpfulLinks.items.map((item) => (
                <li
                  key={item?.text}
                  className="text-sm hover:underline cursor-pointer"
                  onClick={() => {
                    if (item?.link) router.push(item?.link);
                  }}
                >
                  {item?.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-[20px]">
            <h4 className="font-[600] text-[18px]">Contact Info</h4>
            <ul className="flex flex-col gap-[20px]">
              {contactInfo.map((contact) => (
                <li
                  key={contact?.text}
                  className="flex items-start gap-2 text-sm"
                >
                  <span>{contact.icon}</span>
                  <span>{contact.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <HeaderLogoIcon textColor="#ffffff" />
          <div className="text-[14px] leading-[150%]">
            © 2025 Learning+. All Rights Reserved.
          </div>
          <div className="flex gap-4 mt-2 md:mt-0 text-xl">
            <span className="w-[39px] h-[39px] flex items-center justify-center rounded-full border border-[#ffffff] opacity-[80%] cursor-pointer">
              <FaceBookIcon />
            </span>
            <span className="w-[39px] h-[39px] flex items-center justify-center rounded-full border border-[#ffffff] opacity-[80%] cursor-pointer">
              <LinkdinIcon />
            </span>
            <span className="w-[39px] h-[39px] flex items-center justify-center rounded-full border border-[#ffffff] opacity-[80%] cursor-pointer">
              <TwitterIcon />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
