export default function Generalpage() {
  return (
    <>
    <HeroSection />
    <SecondSection />
    <ThirdSection />
    <StudyDestination />
    <SectionDivider />
    <Over15YearsOfExcellence />
    <GFC />
    </>
  );
}
import HeroSection from "@/components/HomepageComponents/HeroSection";
import SecondSection from "@/components/HomepageComponents/SecondSection";
import StudyDestination from "@/components/HomepageComponents/StudyDestination";
import ThirdSection from "@/components/HomepageComponents/ThirdSection";
import SectionDivider from "@/components/HomepageComponents/SectionDivider";
import Over15YearsOfExcellence from "@/components/HomepageComponents/Over15YearsOfExcellence";
import type { Metadata } from "next";
import GFC from "@/components/GeneralFormsComponents/GFC";
export const metadata: Metadata = {
  title: "JnS Education | Home of Study Abroad",
  description: "JnS Education is a leading study abroad consultancy, providing expert guidance and support to students.",
};