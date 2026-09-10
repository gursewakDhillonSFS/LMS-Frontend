"use client";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { Carousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { TestimonialImage } from "@/utils/images";
import { LeftIcon, QuoteIcon, RightIcon } from "@/utils/icons";

interface TestimonialProps {
  name: string;
  role: string;
  image: string;
  feedback: string;
}

const testimonials: TestimonialProps[] = [
  {
    name: "Kyle Merwin",
    role: "Co-owner",
    image: "https://randomuser.me/api/portraits/men/10.jpg",
    feedback:
      "Aut nihil mollitia deserunt quia sed rem. Quibusdam amet veniam rerum id rerum beatae.",
  },
  {
    name: "Samantha Lee",
    role: "Product Designer",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    feedback:
      "Voluptas architecto sequi asperiores unde repellat. Quasi earum officiis quae possimus cum.",
  },
  {
    name: "James Allen",
    role: "Software Engineer",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    feedback:
      "Laborum incidunt deleniti molestiae dolorem nulla itaque. Cupiditate quis animi expedita soluta.",
  },
  {
    name: "Diana Prince",
    role: "UX Specialist",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    feedback:
      "Dolorum cum molestias debitis veniam accusamus. Quaerat minus reiciendis porro explicabo.",
  },
  {
    name: "Mark Rivers",
    role: "Team Lead",
    image: "https://randomuser.me/api/portraits/men/21.jpg",
    feedback:
      "Nostrum laborum suscipit odio iste. Blanditiis dolorem illum id inventore!",
  },
  {
    name: "Emily Clark",
    role: "Project Manager",
    image: "https://randomuser.me/api/portraits/women/55.jpg",
    feedback:
      "Odio totam dicta pariatur? Debitis eius, hic laborum saepe deleniti iusto.",
  },
  {
    name: "Nathan Brown",
    role: "Marketing Lead",
    image: "https://randomuser.me/api/portraits/men/41.jpg",
    feedback:
      "Accusamus perferendis optio nostrum vitae excepturi magnam aut cumque nulla labore.",
  },
  {
    name: "Linda Tran",
    role: "Customer Success",
    image: "https://randomuser.me/api/portraits/women/24.jpg",
    feedback:
      "Autem consequatur facere quibusdam. Minima natus cumque eveniet temporibus, quas deserunt.",
  },
  {
    name: "Robert Kim",
    role: "Operations Manager",
    image: "https://randomuser.me/api/portraits/men/18.jpg",
    feedback:
      "Possimus aperiam deleniti rem voluptas. Fugiat expedita reprehenderit, molestias obcaecati iste.",
  },
  {
    name: "Rachel Adams",
    role: "Content Strategist",
    image: "https://randomuser.me/api/portraits/women/39.jpg",
    feedback:
      "Reiciendis repellendus autem aliquid modi incidunt sit soluta fuga, nihil sed.",
  },
];

const Testimonial = () => {
  const carouselRef = useRef<CarouselRef | null>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  console.log(currentSlide);

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    centerMode: true,
    centerPadding: "350px",
    rtl: false,
    initialSlide: 0,
    autoplay: true,
    draggable: true,
    swipeToSlide: true,
    appendDots: (dots: React.ReactNode) => (
      <div className="flex justify-center items-center">
        <button
          onClick={() => carouselRef.current?.prev()}
          className="cursor-pointer"
        >
          <LeftIcon />
        </button>
        <div className="flex justify-center items-center px-[25px] lg:px-[40px]">
          <ul className="flex gap-3 items-center !m-0">{dots}</ul>
        </div>
        <button
          onClick={() => carouselRef.current?.next()}
          className="cursor-pointer"
        >
          <RightIcon />
        </button>
      </div>
    ),
    afterChange: (current: number) => {
      setCurrentSlide(current);
    },
    responsive: [
      {
        breakpoint: 1230,
        settings: {
          centerPadding: "50px",
        },
      },
      {
        breakpoint: 700,
        settings: {
          centerPadding: "0px",
        },
      },
    ],
  };

  return (
    (testimonials?.length ?? 0) > 0 && (
      <section className="flex flex-col bg-[var(--surface)] border-t border-[var(--border)] py-16 gap-12">
        <div className="flex flex-col items-center text-center gap-3 px-6 max-w-3xl mx-auto">
          <h2 className="text-[28px] md:text-[40px] font-bold text-[var(--text-primary)] tracking-tight">
            Why Learners Choose Us
          </h2>
          <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] leading-relaxed">
            Hear from students and professionals around the world who accelerated their careers and unlocked new possibilities with our platform.
          </p>
        </div>
        <Carousel
          arrows
          ref={carouselRef}
          prefixCls="custom-carousal"
          {...settings}
          className="!pb-12"
        >
          {testimonials?.map((testimonial, index) => (
            <Card data={testimonial} key={index} />
          ))}
        </Carousel>

        <div className="relative px-6 xl:px-48 pt-4">
          <Image
            src={TestimonialImage}
            alt="Testimonial Background"
            fill
            unoptimized
            className="!relative rounded-[12px] opacity-90"
          />
        </div>
      </section>
    )
  );
};

export default Testimonial;

const Card: React.FC<{ data: TestimonialProps }> = ({ data }) => (
  <div className="rounded-[12px] bg-white border border-[var(--border)] shadow-xs relative p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 mx-3">
    <div className="relative shrink-0">
      <Image
        src={data.image}
        alt={data.name}
        width={100}
        height={100}
        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full border-2 border-[var(--border)]"
        unoptimized
      />
    </div>
    <div className="flex-1 flex flex-col justify-between gap-4 text-center md:text-left">
      <p className="leading-relaxed text-[15px] md:text-[16px] text-[var(--text-primary)] italic">
        &ldquo;{data.feedback}&rdquo;
      </p>
      <div className="flex flex-col">
        <span className="font-semibold text-[15px] text-[var(--text-primary)]">{data.name}</span>
        <span className="text-[13px] text-[var(--text-secondary)]">{data.role}</span>
      </div>
    </div>
  </div>
);
