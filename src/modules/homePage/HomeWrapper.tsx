import React from "react";
import HeroSection from "./HeroSection";
import HomeImageCarousel from "./HomeImageCarousel";
import ModernSkills from "./ModernSkills";
import ExploreSkill from "./ExploreSkill";
import FrequentlyQuestions from "./FrequentlyQuestions";
import Testimonials from "./Testimonials";
import Subscription from "./Subscription";
import NewCourses from "./NewCourses";

const HomeWrapper = () => {
  return (
    <div>
      <HeroSection />
      <HomeImageCarousel />
      <ModernSkills />
      <ExploreSkill />
      <Subscription />
      <NewCourses />
      <Testimonials />
      <FrequentlyQuestions />
    </div>
  );
};

export default HomeWrapper;
