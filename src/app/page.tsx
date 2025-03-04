'use client';

import Header from '../components/header'
import ThemeSwitch from '@/components/ThemeSwitch'
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { FlipWords } from "@/components/ui/flip-words";

export default function Index() {

  const words = ["TypeScript를", "C++을", "Swift를"];

  return (
    <>
      <Header />
      <ThemeSwitch />
      <div className="h-[40rem] flex justify-center items-center px-4">
        <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
          <FlipWords words={words} />주로 다루는 학생 개발자입니다.
        </div>
      </div>
      <StarsBackground />
      <ShootingStars />
    </>
  )
}