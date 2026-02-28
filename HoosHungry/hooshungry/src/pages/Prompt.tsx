import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ChatContainer, NavigationDark } from "../components/prompt";
import Navigation from "../components/common/Navigation";
import {
  LiquidEther,
  GradientText,
  SpotlightCard,
  FadeContent,
  BlurText,
} from "../components/reactbits";
import FloatingLines from "../components/reactbits/FloatingLines";

export default function Prompt() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isTransitioned, setIsTransitioned] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Orchestrate staggered entrance animations
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Background transition
    timers.push(setTimeout(() => setIsTransitioned(true), 50));

    // Header fades in
    timers.push(setTimeout(() => setShowHeader(true), 400));

    // Chat container scales in
    timers.push(setTimeout(() => setShowChat(true), 600));

    // Footer fades in
    timers.push(setTimeout(() => setShowFooter(true), 900));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col transition-all duration-700 ease-out relative overflow-hidden bg-gray-950"
    >
      {/* Liquid Ether Background - Full Page */}
      {isTransitioned && (
        <>
          <LiquidEther
            colors={["#78350f", "#c2410c", "#ea580c"]}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 0,
            }}
          />
          {/*
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            <FloatingLines
              linesGradient={["#78350f", "#c2410c", "#ea580c", "#fb923c"]}
              enabledWaves={["top", "middle", "bottom"]}
              lineCount={[8, 12, 16]}
              lineDistance={[10, 8, 5]}
              animationSpeed={0.6}
              bendRadius={5.0}
              bendStrength={-10}
              interactive={false}
              parallax={false}
              mixBlendMode="screen"
            />
          </div> /*)

          {/* Dark overlay for better readability */}
          {/* <div className="fixed inset-0 bg-gray-950/40 pointer-events-none z-[1]" /> */}
          {/* Subtle noise texture */}
          {/* Vignette overlay */}
        </>
      )}

      {/* Navigation - Cross-fades from light to dark mode */}
      <div className="relative z-20">
        {/* Light mode navigation */}
        <div
          style={{
            opacity: isTransitioned ? 0 : 1,
            transition: "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Navigation />
        </div>

        {/* Dark mode navigation */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            opacity: isTransitioned ? 1 : 0,
            transition: "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <NavigationDark />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Page Header - Fades in with blur */}
          <div
            className="mb-4 sm:mb-6"
            style={{
              opacity: showHeader ? 1 : 0,
              transform: showHeader ? "translateY(0)" : "translateY(20px)",
              filter: showHeader ? "blur(0px)" : "blur(10px)",
              transition:
                "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0, 0.2, 1), filter 600ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <GradientText
                colors={["#f97316", "#fb923c", "#fdba74", "#fb923c", "#f97316"]}
                animate={true}
                animationDuration={4}
              >
                Prompt
              </GradientText>
            </h1>
            <div className="mt-2">
              <BlurText
                text="Chat with CavBot to optimize your meal plan"
                delay={600}
                duration={0.5}
                className="text-gray-400 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Chat Container - Scales and fades in */}
          <div
            className="flex-1 flex flex-col min-h-[500px] sm:min-h-[600px]"
            style={{
              opacity: showChat ? 1 : 0,
              transform: showChat
                ? "scale(1) translateY(0)"
                : "scale(0.95) translateY(20px)",
              filter: showChat ? "blur(0px)" : "blur(5px)",
              transition:
                "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1), transform 700ms cubic-bezier(0.4, 0, 0.2, 1), filter 700ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <SpotlightCard
              className="flex-1 flex flex-col h-full"
              spotlightColor="rgba(249, 115, 22, 0.1)"
              borderColor="rgba(249, 115, 22, 0.25)"
            >
              <ChatContainer />
            </SpotlightCard>
          </div>

          {/* Footer Info - Fades in last */}
          <div
            className="mt-4 text-center"
            style={{
              opacity: showFooter ? 1 : 0,
              transform: showFooter ? "translateY(0)" : "translateY(10px)",
              transition:
                "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <p className="text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Powered by AI
              </span>
              <span className="mx-2">•</span>
              CavBot uses AI to provide meal suggestions based on UVA dining
              hall menus.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom ambient glow */}
      {isTransitioned && (
        <div className="fixed bottom-0 left-0 right-0 h-48 pointer-events-none z-[4]">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-orange-500/5 to-transparent" />
        </div>
      )}
    </div>
  );
}
