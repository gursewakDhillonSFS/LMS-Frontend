import React from "react";
import HeroSection from "./HeroSection";
import ExploreSkill from "./ExploreSkill";
import NewCourses from "./NewCourses";
import ModernSkills from "./ModernSkills";
import HomeImageCarousel from "./HomeImageCarousel";
import Testimonials from "./Testimonials";
import FrequentlyQuestions from "./FrequentlyQuestions";

const HomeWrapper = () => {
  return (
    <div className="flex flex-col w-full bg-white">
      <HeroSection />
      <ExploreSkill />
      <NewCourses />
      <ModernSkills />
      <HomeImageCarousel />
      <Testimonials />
      <FrequentlyQuestions />
    </div>
  );
};

export default HomeWrapper;
