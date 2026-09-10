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
          <div key={index} className="px-2 pb-2">
            <div className="relative w-full h-[260px] lg:h-[340px] rounded-[10px] overflow-hidden group cursor-pointer shadow-xs">
              <Image
                src={category.image}
                alt={category.title}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white text-[18px] lg:text-[20px] font-bold leading-tight">
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
