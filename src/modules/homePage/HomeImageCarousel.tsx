import React from "react";
import { Carousel } from "antd";
import Image from "next/image";
import { CardImage, Home2, Home3, Home4, Home5 } from "@/utils/images";

const categories = [
  {
    title: "Animation",
    image: Home2,
  },
  {
    title: "UI/UX Design",
    image: Home3,
  },
  {
    title: "Video Editing",
    image: Home4,
  },
  {
    title: "Data Science",
    image: Home5,
  },
  {
    title: "Graphic Design",
    image: Home2,
  },
  {
    title: "Web Development",
    image: Home3,
  },
  {
    title: "Marketing",
    image: Home4,
  },
  {
    title: "Creative Writing",
    image: Home5,
  },
  {
    title: "Photography",
    image: CardImage,
  },
  {
    title: "Music Production",
    image: Home2,
  },
];

const HomeImageCarousel = () => {
  return (
    <div className="w-full pt-[25px] lg:pt-[50px]">
      <Carousel
        dots={false}
        slidesToShow={5}
        slidesToScroll={1}
        infinite
        arrows
        autoplay
        responsive={[
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
            },
          },
          {
            breakpoint: 640,
            settings: {
              slidesToShow: 2,
            },
          },
        ]}
      >
        {categories.map((category, index) => (
          <div key={index}>
            <div className="relative w-full h-[284px] lg:h-[384px]">
              <Image
                src={category.image}
                alt={category.title}
                fill
                unoptimized
              />
              <div className="w-full h-[388px] absolute bg-black opacity-42"></div>
              <div className="absolute top-[22px] left-[20px] text-white text-[24px] font-[700] leading-[120%]">
                {category.title}
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default HomeImageCarousel;
