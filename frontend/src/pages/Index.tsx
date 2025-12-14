import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
// import AboutSection from '@/components/AboutSection';
// import CredentialsThatMatterSection from '@/components/CredentialsSection';
// import AgentsSection from '@/components/AgentsSection';
// import HowItWorksSection from '@/components/HowItWorksSection';
// import AgenticCapabilitiesMap from '@/components/AgenticCapabilitiesMap';
// import ProcessBar from '@/components/ProcessBar';
// import HighlightSections from '@/components/HighlightSections';
// import SupportSection from '@/components/SupportSection';
import LicenseSection from '@/components/LicenseSection';
import OnboardingVideoSection from '@/components/OnboardingVideoSection';
import Footer from '@/components/Footer';
// import MakesDifferentSection from '@/components/MakesDifferentSection';
// import FounderJourneySection from '@/components/FounderJourneySection';
// import BadgesSection from '@/components/BadgesSection';
import VoiceIntro from '@/components/VoiceIntro';

const Index = () => {

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <Header />
      <main className="bg-white flex-grow overflow-y-auto scroll-smooth snap-y snap-mandatory relative z-10">
        <section className="snap-start">
          <HeroSection />
        </section>
        <section className="snap-start" id="onboarding-video">
          <OnboardingVideoSection />
        </section>
        {/* <section className='snap-start' id="how-it-works">
          <HowItWorksSection />
        </section> */}
        {/* <section className='snap-start' id="agentic-capabilities">
          <AgenticCapabilitiesMap />
        </section>
        <section className='snap-start' id="process-bar">
          <ProcessBar />
        </section>
        <section className="snap-start" id="founder-journey">
          <FounderJourneySection />
        </section>
        <section className="snap-start" id="agents">
          <AgentsSection />
        </section>
        <section className="snap-start" id="badges">
          <BadgesSection />
        </section>
        <section className="snap-start" id="highlights">
          <HighlightSections />
        </section>
        <section className="snap-start" id="support">
          <SupportSection />
        </section>
        <section className="snap-start" id="credentials">
          <CredentialsThatMatterSection />
        </section>
        <section className='snap-start' id="about">
          <AboutSection />
        </section>
        <section className='snap-start' id="makes-different">
          <MakesDifferentSection />
        </section> */}
        <section className="snap-start" id="licensing">
          <LicenseSection />
        </section>
      </main>
      <Footer />
      <VoiceIntro />
    </div>
  );
};

export default Index;
