'use client';

import useScroll from '@/hooks/useScroll';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/landingpage/Hero';
import CognitiveTension from '@/components/landingpage/CognitiveTension';
import SystemIntelligence from '@/components/landingpage/SystemIntelligence';
import ExperientialFlow from '@/components/landingpage/ExperientialFlow';
import AcademicCredibility from '@/components/landingpage/AcademicCredibility';
import ForwardVision from '@/components/landingpage/ForwardVision';
import ClosingMoment from '@/components/landingpage/ClosingMoment';

export default function Home() {
    useScroll();

    return (
        <main>
            <Navbar />
            <Hero />
            <CognitiveTension />
            <SystemIntelligence />
            <ExperientialFlow />
            <AcademicCredibility />
            <ForwardVision />
            <ClosingMoment />
        </main>
    );
}
