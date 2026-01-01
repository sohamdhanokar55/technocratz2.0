import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SparklesCore } from "@/components/SparklesCore";
import { RetroGrid } from "@/components/ui/retro-grid";
import GradualBlur from "@/components/GradualBlur";
import {
  Trophy,
  Target,
  Users,
  Code,
  Monitor,
  Keyboard,
  FileText,
  Zap,
  CircuitBoard,
  Mail,
  Phone,
  MapPin,
  ChevronUp,
  Instagram,
  Globe,
  Linkedin,
  Youtube,
  MessageCircle,
} from "lucide-react";
// import heroImage from "@/assets/hero-bg.jpg";
import agnelLogo from "@/assets/agnel-logo.png";
import agnelCampus from "@/assets/agnel-campus.jpg";
import principalImage from "@/assets/principal.jpeg";
import technocratzLogo from "@/assets/technocratz-logo.png";
// import technocratzLogo from "@/assets/codecratz-logo.png"; // Placeholder for TechnoCratz logo

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    department: "",
    semester: "",
    teamMembers: "",
  });

  const [selectedCompetition, setSelectedCompetition] = useState<any | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Helper function to extract max participants and fee
  const getCompetitionDetails = (competition: any) => {
    const note = competition.note || {};

    // Try different key variations for max participants
    let maxParticipantsStr =
      note["Maximum No.of Participants"] ||
      note["Maximum no of participants"] ||
      note["Maximum No of participants"] ||
      "1";

    // Try different key variations for fee
    let feeStr = note["Participation Fee"] || "0";

    const maxParticipants = parseInt(maxParticipantsStr) || 1;
    const fee = parseInt(feeStr.replace(/[^\d]/g, "")) || 0;

    return { maxParticipants, fee };
  };

  // Map competition titles to their registration routes
  const getRegistrationRoute = (title: string): string => {
    const routeMap: Record<string, string> = {
      "TECHNICAL MIMIC": "/register/technical-mimic",
      "AUTOCAD COMPETITION": "/register/autocad",
      "BLIND TYPING": "/register/blind-typing",
      "ROBONOVA – ROBO RACE": "/register/robo-race",
      "HACK YOUR WAY": "/register/hack-your-way",
      "BRIDGE BUILDING": "/register/bridge-building",
    };
    return routeMap[title] || "/register";
  };

  const handleRegisterClick = (competition: any) => {
    try {
      if (!competition) {
        throw new Error("No competition selected");
      }

      const route = getRegistrationRoute(competition.title);
      navigate(route);
    } catch (error) {
      console.error("Error in handleRegisterClick:", error);
      toast({
        title: "Error",
        description: "Failed to process registration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.college || !formData.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Registration Successful!",
      description: "We'll contact you with further details soon.",
    });
    setFormData({
      name: "",
      college: "",
      department: "",
      semester: "",
      teamMembers: "",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Countdown timer for registration deadline (Jan 12, 2026)
  useEffect(() => {
    const updateCountdown = () => {
      const registrationDeadline = new Date("2026-01-12T23:59:59").getTime();
      const now = new Date().getTime();
      const difference = registrationDeadline - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const competitions = [
    {
      title: "TECHNICAL MIMIC",
      icon: Target,
      description:
        "A competition testing your technical knowledge and mimicry skills.",
      rules: [
        "The decision of moderator will be final.",
        "Electronic Devices are not allowed.",
        "Only 2nd and 3rd year students are eligible to participate.",
        "It will be department wise (CE | AE| ME | TE | AN)",
        "Few rules would be announced on the event place.",
      ],
      note: {
        "Maximum No.of Participants": "4",
        "Participation Fee": "Rs. 200",
        Time: "2:30 PM",
      },
    },
    {
      title: "AUTOCAD COMPETITION",
      icon: Monitor,
      description:
        "Showcase your design skills and precision in computer-aided design challenges.",
      rules: [
        "Participation Fee- Rs. 50/-",
        "Time: 1:30 PM",
        "There will be 2 Rounds.",
        "Top 50% Participants will be selected for the Final Round.",
        "Eligibility for Final Round will be based on timely Submission.",
        "Student should follow the below criteria:",
        "Electronic Devices are not allowed.",
        "Drawing with proper Dimension & Scale",
        "Accuracy & Neatness",
      ],
      rounds: {
        "CIVIL GROUP": ["Round I- G+2 Plan", "Round II- Elevation"],
        "MECHANICAL GROUP": ["Round I- 2D Drawing", "Round II- 3D Drawing"],
      },
      note: {
        "Maximum no of participants": "2",
        "Participation Fee": "Rs 100",
        Time: "1:30 PM",
      },
    },
    {
      title: "BLIND TYPING",
      icon: Keyboard,
      description:
        "Speed and accuracy challenge to test your typing skills without looking at the keyboard.",
      rules: [
        "Participants will be evaluated based on their prioritization of accuracy over speed in typing challenges.",
        "Advancement to the next round will be determined by the fastest submission with the highest accuracy",
        "Few rules will be announced at event place.",
      ],
      note: {
        "Maximum no of participants": "1",
        "Participation Fee": "Rs. 50/-",
        Time: "1:30 PM",
      },
    },
    {
      title: "ROBONOVA – ROBO RACE",
      icon: Code,
      description:
        "Build and race your robots in this exciting robotics competition.",
      rules: [
        "Robot size must not exceed 250 × 200 × 150 mm.",
        "Robots can be wired or wireless (wired bots must have wire long enough to cover the track).",
        "Battery voltage must be below 12V DC, and batteries must be sealed types.",
        "Team must consist of maximum 2 members with valid college ID.",
        "Unethical behavior and arguments with judges lead to disqualification.",
        "No test practice is allowed on the arena.",
        "Robots must not damage the track or arena.",
      ],
      trackRules: [
        "Track may include uneven surfaces and obstacles to slow down the robot.",
        "Event follows a trial system with qualifying rounds.",
        "Top 5 teams from trials enter the final round.",
        "If a robot starts before the signal, the run restarts (repeated violations lead to disqualification).",
        "If a robot crosses a checkpoint and goes off-track, it must resume from the previous checkpoint with a penalty.",
        "Teams may repair/touch the robot during the run, but time keeps running.",
        "Judgement is based on time taken and checkpoints cleared.",
        "No second chance is given after completing the final run.",
      ],
      note: {
        "Maximum no of participants": "2",
        "Participation Fee": "Rs 100",
        Time: "1:30 PM",
      },
    },
    {
      title: "HACK YOUR WAY",
      icon: Code,
      description:
        "Code without syntax highlighting or auto-completion. Pure programming skills test.",
      rules: [
        "Participants will be evaluated based on their prioritization of accuracy over speed in coding challenges.",
        "Internet access will not be available during the event.",
        "Advancement to the next round will be determined by the fastest submission of code with the highest accuracy.",
        "Coding languages allowed for the competition is C programming.",
      ],
      note: {
        "Maximum no of participants": "1",
        "Participation Fee": "Rs. 50/-",
        Time: "1:30 PM",
      },
    },
    {
      title: "BRIDGE BUILDING",
      icon: CircuitBoard,
      description:
        "Design and simulate electronic circuits to solve real-world engineering problems.",
      rules: [
        "ROUND 1: Circuit to be built on the breadboard, Circuit diagram will be given on the spot (Time limit is 30 mins)",
        "ROUND 2: Circuit Name / Problem Statement will be given for building circuit. (Time Limit 30 Min)",
        "Breadboard and all required components will be provided.",
      ],
      note: {
        "Maximum no of participants": "2",
        "Participation Fee": "Rs 100",
        Time: "1:30 PM",
      },
    },
  ];

  const highlights = [
    {
      icon: Target,
      title: "Learn",
      description:
        "Gain knowledge from industry experts and cutting-edge technologies.",
    },
    {
      icon: Trophy,
      title: "Compete",
      description:
        "Challenge yourself against the brightest minds in technical competitions.",
    },
    {
      icon: Users,
      title: "Win",
      description:
        "Earn recognition, prizes, and build valuable professional connections.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 text-sm pt-32">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-lg border-b border-blue-500/30 z-50 shadow-lg"
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-6 text-2xl md:text-3xl font-bold"
            >
              <img
                src={agnelLogo}
                alt="Agnel Polytechnic Logo"
                className="w-20 h-20 object-contain hover:scale-110 transition-transform duration-300"
              />
              <img
                src={technocratzLogo}
                alt="TechnoCratz Logo"
                className="w-24 h-24 object-contain hover:scale-110 transition-transform duration-300"
              />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                APV TECHNOCRATZ 2.0
              </span>
            </motion.div>
            <div className="hidden md:flex space-x-10">
              {[
                "Home",
                "About",
                "Leadership",
                "Competitions",
                "Register",
                "Contact",
              ].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 font-semibold text-lg"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>
      {/* Hero Section - Completely Restructured */}
      <section
        id="hero"
        className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden"
      >
        {/* Retro Grid Background */}
        <div className="absolute inset-0 -z-20">
          <RetroGrid angle={65} />
        </div>

        {/* Particle Background */}
        <div className="absolute inset-0 -z-10">
          <SparklesCore
            background="#000000"
            minSize={0.8}
            maxSize={2.5}
            particleDensity={80}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={1}
          />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="flex items-center justify-center min-h-[80vh]">
            {/* Centered Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-5xl mx-auto"
            >
              {/* Main Heading with letter animation */}
              <div className="space-y-4 mb-8">
                {/* Glowing badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="inline-block mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-400/50 backdrop-blur-sm"
                >
                  <span className="text-cyan-400 font-semibold text-sm">
                    🚀 TECHNOCRATZ 2.0 - LIVE EVENT
                  </span>
                </motion.div>

                <motion.h1
                  initial="hidden"
                  animate="visible"
                  transition={{ delayChildren: 0.25 }}
                  className="text-4xl sm:text-5xl lg:text-8xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-lg px-4"
                >
                  {"TECHNOCRATZ 2.0".split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.28 }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.9 }}
                  className="text-base sm:text-lg lg:text-2xl text-blue-300 font-medium px-4"
                >
                  <span className="font-semibold">
                    Agnel Polytechnic, Vashi
                  </span>{" "}
                  — Innovate • Compete • Conquer
                </motion.p>
              </div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                  staggerChildren: 0.1,
                }}
                className="space-y-4 text-xl text-gray-300 leading-relaxed mb-10 max-w-3xl mx-auto"
              >
                <p>
                  Join{" "}
                  <span className="text-cyan-400 font-semibold">
                    6 thrilling tech competitions
                  </span>{" "}
                  and showcase your skills against the brightest minds in
                  technology.
                </p>
                <p>
                  Compete for{" "}
                  <span className="text-blue-400 font-semibold">
                    exciting prizes
                  </span>
                  , gain invaluable experience, and build connections that will
                  shape your future.
                </p>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="grid grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="text-center p-6 rounded-xl hover:bg-blue-500/10 transition-all duration-300 border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 shadow-lg shadow-blue-500/20"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2"
                  >
                    6
                  </motion.div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
                    Competitions
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="text-center p-6 rounded-xl hover:bg-purple-500/10 transition-all duration-300 border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 shadow-lg shadow-purple-500/20"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
                  >
                    500+
                  </motion.div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
                    Participants
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="text-center p-6 rounded-xl hover:bg-green-500/10 transition-all duration-300 border border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5 shadow-lg shadow-green-500/20"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2"
                  >
                    ₹50K+
                  </motion.div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
                    Prizes
                  </div>
                </motion.div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 px-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 text-white text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 group ring-2 ring-cyan-400/50 hover:ring-cyan-300 rounded-xl font-bold shadow-lg shadow-cyan-500/50 transition-all duration-300 w-full sm:w-auto"
                  >
                    <a
                      href="#competitions"
                      className="flex items-center justify-center"
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById("competitions");
                        if (element) {
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      >
                        <Zap className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                      </motion.div>
                      Register Now
                    </a>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    className="border-2 border-purple-400 text-purple-300 text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 group ring-2 ring-purple-400/50 hover:ring-purple-300 rounded-xl font-bold bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 shadow-lg shadow-purple-500/30 w-full sm:w-auto"
                  >
                    <a
                      href="#competitions"
                      className="flex items-center justify-center"
                    >
                      <Trophy className="w-6 h-6 mr-3 group-hover:text-purple-200 transition-colors group-hover:animate-bounce" />
                      Explore Events
                    </a>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Event Date */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-12"
              >
                <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/50 backdrop-blur-sm">
                  <p className="text-lg font-semibold text-transparent bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text">
                    📅 17th January 2026 | 📍 Agnel Polytechnic, Vashi
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Gradual Blur Effect */}
        <GradualBlur
          target="parent"
          position="bottom"
          height="6rem"
          strength={2}
          divCount={5}
          curve="bezier"
          exponential={true}
          opacity={1}
        />
      </section>
      {/* About Section */}
      <section
        id="about"
        className="py-16 bg-gradient-to-b from-slate-950 via-black to-slate-950 relative overflow-hidden"
      >
        {/* Reduced particle effect for better performance */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <SparklesCore
            background="transparent"
            minSize={0.6}
            maxSize={1.2}
            particleDensity={30}
            className="w-full h-full"
            particleColor="#3B82F6"
          />
        </div>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-6">
              APV TECHNOCRATZ 2.0
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              APV TECHNOCRATZ 2.0 is the premier technical event organized by
              Agnel Polytechnic in association with Institution's Innovation
              Council (IIC). Experience cutting-edge competitions, innovative
              challenges, and networking opportunities that will shape your
              technical career. Join us for an unforgettable journey of
              learning, competing, and conquering the world of technology.
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                  transition: { duration: 0.3 },
                }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-500/30 p-6 text-center h-full hover:border-cyan-400/50 transition-all duration-300">
                  <CardContent className="pt-6">
                    <motion.div
                      className="mb-6"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <highlight.icon className="w-16 h-16 mx-auto text-cyan-400" />
                    </motion.div>
                    <motion.h3
                      className="text-2xl font-bold text-white mb-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      {highlight.title}
                    </motion.h3>
                    <p className="text-gray-300 leading-relaxed">
                      {highlight.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Competitions Section (moved above Leadership) */}
      <section
        id="competitions"
        className="py-20 bg-gradient-to-b from-slate-950 via-black to-slate-950 relative overflow-hidden"
      >
        {/* Removed particles from this section for better performance */}
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 backdrop-blur-sm"
            >
              <span className="text-purple-400 font-semibold text-sm">
                ⚡ TECHNICAL CHALLENGES
              </span>
            </motion.div>

            <motion.h2
              className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {"COMPETITIONS".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Choose your battleground and showcase your technical prowess in
              these exciting competitions.
            </motion.p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {competitions.map((competition, index) => (
              <motion.div
                key={competition.title}
                onClick={() => {
                  setSelectedCompetition(competition);
                  setIsModalOpen(true);
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative h-full bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-blue-500/40 rounded-2xl p-8 hover:border-cyan-400/70 transition-all duration-300 backdrop-blur-md overflow-hidden shadow-xl shadow-blue-500/10 hover:shadow-cyan-500/20">
                  {/* Animated background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-blue-500/15 group-hover:via-cyan-500/15 group-hover:to-blue-500/15 transition-all duration-500" />

                  {/* Glow effect on hover */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 -z-10" />

                  <div className="relative z-10">
                    <motion.div
                      className="mb-6 inline-block p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <competition.icon className="w-12 h-12 text-cyan-400 group-hover:text-blue-300 transition-colors duration-300" />
                    </motion.div>

                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors duration-300">
                      {competition.title}
                    </h3>

                    <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                      {competition.description}
                    </p>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-6"
                    >
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:via-cyan-600 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/60 border border-cyan-400/50"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          setSelectedCompetition(competition);
                          setIsModalOpen(true);
                        }}
                      >
                        View Details →
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section
        id="timeline"
        className="py-20 bg-gradient-to-b from-slate-950 via-black to-slate-950 relative overflow-hidden"
      >
        {/* Removed particles from this section for better performance */}
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 backdrop-blur-sm"
            >
              <span className="text-green-400 font-semibold text-sm">
                📅 EVENT TIMELINE
              </span>
            </motion.div>

            <motion.h2
              className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-green-400 via-emerald-300 to-green-300 bg-clip-text text-transparent drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Event Schedule
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Follow the journey of TechnoCratz 2.0 from launch to celebration
            </motion.p>
          </motion.div>

          {/* Timeline Container */}
          <div ref={timelineRef} className="relative max-w-5xl mx-auto px-4">
            {/* Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-500 via-emerald-500 to-green-500 rounded-full top-0" />

            {/* Timeline Events */}
            <div className="space-y-20">
              {/* Event 1 - Launch Date */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-8 items-center relative"
              >
                {/* Left Content - Date */}
                <div className="text-right">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/50 backdrop-blur-sm inline-block"
                  >
                    <p className="text-2xl font-bold text-green-400">Jan 4</p>
                    <p className="text-sm text-gray-400">2026</p>
                  </motion.div>
                </div>

                {/* Center Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <motion.div
                    whileHover={{ scale: 1.3 }}
                    className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-4 border-slate-950 shadow-lg shadow-green-500/50 cursor-pointer"
                  />
                </div>

                {/* Right Content - Details */}
                <div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-green-500/40 backdrop-blur-md shadow-lg shadow-green-500/10 hover:shadow-green-500/30 transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold text-green-400 mb-2">
                      🚀 Launch Date
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Registration portal opens. Get ready to showcase your
                      skills!
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Event 2 - Registration Deadline */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-8 items-center relative"
              >
                {/* Left Content - Details */}
                <div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-blue-500/40 backdrop-blur-md shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30 transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold text-blue-400 mb-2">
                      📝 Registration Deadline
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Last chance to register! Secure your spot in the
                      competition.
                    </p>
                  </motion.div>
                </div>

                {/* Center Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <motion.div
                    whileHover={{ scale: 1.3 }}
                    className="w-5 h-5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full border-4 border-slate-950 shadow-lg shadow-blue-500/50 cursor-pointer"
                  />
                </div>

                {/* Right Content - Date */}
                <div className="text-left">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/50 backdrop-blur-sm inline-block"
                  >
                    <p className="text-2xl font-bold text-blue-400">Jan 12</p>
                    <p className="text-sm text-gray-400">2026</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Event 3 - Competition Day 1 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-8 items-center relative"
              >
                {/* Left Content - Date */}
                <div className="text-right">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/50 backdrop-blur-sm inline-block"
                  >
                    <p className="text-2xl font-bold text-purple-400">Jan 16</p>
                    <p className="text-sm text-gray-400">2026</p>
                  </motion.div>
                </div>

                {/* Center Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <motion.div
                    whileHover={{ scale: 1.3 }}
                    className="w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-4 border-slate-950 shadow-lg shadow-purple-500/50 cursor-pointer"
                  />
                </div>

                {/* Right Content - Details */}
                <div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-purple-500/40 backdrop-blur-md shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold text-purple-400 mb-2">
                      ⚡ Competition Day 1
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Preliminary rounds begin. Showcase your technical prowess!
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Event 4 - Competition Day 2 */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-8 items-center relative"
              >
                {/* Left Content - Details */}
                <div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-orange-500/40 backdrop-blur-md shadow-lg shadow-orange-500/10 hover:shadow-orange-500/30 transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold text-orange-400 mb-2">
                      🔥 Competition Day 2
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Finals and intense battles. Who will be crowned champion?
                    </p>
                  </motion.div>
                </div>

                {/* Center Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <motion.div
                    whileHover={{ scale: 1.3 }}
                    className="w-5 h-5 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full border-4 border-slate-950 shadow-lg shadow-orange-500/50 cursor-pointer"
                  />
                </div>

                {/* Right Content - Date */}
                <div className="text-left">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-400/50 backdrop-blur-sm inline-block"
                  >
                    <p className="text-2xl font-bold text-orange-400">Jan 17</p>
                    <p className="text-sm text-gray-400">2026</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Event 5 - Prize Distribution */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-8 items-center relative"
              >
                {/* Left Content - Date */}
                <div className="text-right">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-400/50 backdrop-blur-sm inline-block"
                  >
                    <p className="text-2xl font-bold text-yellow-400">Jan 17</p>
                    <p className="text-sm text-gray-400">2026</p>
                  </motion.div>
                </div>

                {/* Center Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <motion.div
                    whileHover={{ scale: 1.3 }}
                    className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full border-4 border-slate-950 shadow-lg shadow-yellow-500/50 cursor-pointer"
                  />
                </div>

                {/* Right Content - Details */}
                <div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-yellow-500/40 backdrop-blur-md shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/30 transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">
                      🏆 Prize Distribution
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Celebrate the winners! Recognition and rewards await the
                      champions.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section
        id="countdown"
        className="py-20 bg-gradient-to-b from-slate-950 via-black to-slate-950 relative overflow-hidden"
      >
        {/* Removed particles from this section for better performance */}
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/50 backdrop-blur-sm"
            >
              <span className="text-red-400 font-semibold text-sm">
                ⏰ REGISTRATION CLOSING IN
              </span>
            </motion.div>

            <motion.h2
              className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-red-400 via-pink-300 to-red-300 bg-clip-text text-transparent drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Registration Deadline
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Don't miss your chance to compete! Secure your spot before the
              deadline.
            </motion.p>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {/* Days */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-500 to-red-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-red-500/40 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl shadow-red-500/10 group-hover:shadow-red-500/30 transition-all duration-300">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2"
                  >
                    {String(countdown.days).padStart(2, "0")}
                  </motion.div>
                  <div className="text-sm md:text-base font-semibold text-gray-400 uppercase tracking-wider">
                    Days
                  </div>
                </div>
              </motion.div>

              {/* Hours */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-orange-500/40 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl shadow-orange-500/10 group-hover:shadow-orange-500/30 transition-all duration-300">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2"
                  >
                    {String(countdown.hours).padStart(2, "0")}
                  </motion.div>
                  <div className="text-sm md:text-base font-semibold text-gray-400 uppercase tracking-wider">
                    Hours
                  </div>
                </div>
              </motion.div>

              {/* Minutes */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-yellow-500/40 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl shadow-yellow-500/10 group-hover:shadow-yellow-500/30 transition-all duration-300">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2"
                  >
                    {String(countdown.minutes).padStart(2, "0")}
                  </motion.div>
                  <div className="text-sm md:text-base font-semibold text-gray-400 uppercase tracking-wider">
                    Minutes
                  </div>
                </div>
              </motion.div>

              {/* Seconds */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-cyan-500/40 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl shadow-cyan-500/10 group-hover:shadow-cyan-500/30 transition-all duration-300">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2"
                  >
                    {String(countdown.seconds).padStart(2, "0")}
                  </motion.div>
                  <div className="text-sm md:text-base font-semibold text-gray-400 uppercase tracking-wider">
                    Seconds
                  </div>
                </div>
              </motion.div>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="bg-gradient-to-r from-red-600 via-pink-500 to-red-400 text-white text-lg px-12 py-6 group ring-2 ring-pink-400/50 hover:ring-pink-300 rounded-xl font-bold shadow-lg shadow-pink-500/50 transition-all duration-300"
                >
                  <a
                    href="#register"
                    className="flex items-center justify-center"
                  >
                    <Zap className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                    Register Now Before It's Too Late!
                  </a>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Leadership Section (commented out as requested) */}
      {/*
      <section
        id="leadership"
        className="py-16 bg-matte-hero relative overflow-hidden"
      >
        ...leadership content commented out...
      </section>
      */}
      {/* About Us Section */}
      <section
        id="about-us"
        className="py-16 bg-gradient-to-b from-slate-950 via-black to-slate-950 relative overflow-hidden"
      >
        {/* Sparkles Background */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <SparklesCore
            background="transparent"
            minSize={0.5}
            maxSize={1.5}
            particleDensity={40}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={0.8}
          />
        </div>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-4">
                  About Us
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mb-6"></div>
              </div>

              <div className="text-lg text-gray-300 leading-relaxed space-y-4">
                <p>
                  The founder of Agnel Ashram, Fr. C. Rodrigues was a great
                  visionary. His vision was to foster love and understanding
                  among the various communities in India and to contribute to
                  the development of self-reliance among the youth through
                  education.
                </p>

                <p>
                  Agnel Polytechnic in Vashi, Navi Mumbai, was started in 1983
                  with only one program – Diploma in Civil Engineering. It has
                  grown since then, and today we have five branches of study in
                  the polytechnic – Civil Engineering, Mechanical Engineering,
                  Automobile Engineering, Electronics & Computer Engineering and
                  Artificial Intelligence & Machine learning.
                </p>

                <p>
                  What makes Agnel Polytechnic a unique institution in Mumbai is
                  its discipline and culture and the dedication of the faculty
                  in imparting knowledge and expertise to the students in a
                  cosmopolitan atmosphere.
                </p>
              </div>
            </motion.div>

            {/* Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-blue-500/30 shadow-lg shadow-cyan-500/20 bg-slate-900">
                <img
                  src={agnelCampus}
                  alt="Agnel Polytechnic Campus"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Decorative Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400/20 rounded-full"
              />
            </motion.div>
          </div>
        </div>
      </section>
      {/* Competitions moved above; modal and WhatsApp community placed here */}

      {isModalOpen && selectedCompetition && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-gradient-to-br from-slate-900 to-black rounded-2xl shadow-2xl w-full max-w-2xl my-8 border border-blue-500/30">
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <motion.h3
                  className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {selectedCompetition.title.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.3 }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.h3>
                <p className="mb-6 text-gray-300 text-base leading-relaxed">
                  {selectedCompetition.description}
                </p>

                {/* Rules Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold mb-4 text-cyan-400 border-b-2 border-blue-500/30 pb-2">
                    RULES FOR THE COMPETITION
                  </h4>
                  <ul className="space-y-3">
                    {selectedCompetition.rules?.map(
                      (rule: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-cyan-400 font-bold mt-0.5 flex-shrink-0">
                            •
                          </span>
                          <span className="text-gray-300 text-sm leading-relaxed">
                            {rule}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Track Rules for Robo Race */}
                {selectedCompetition.trackRules && (
                  <div className="mb-6">
                    <h4 className="text-lg font-bold mb-4 text-cyan-400 border-b-2 border-blue-500/30 pb-2">
                      TRACK & GAME RULES
                    </h4>
                    <ul className="space-y-3">
                      {selectedCompetition.trackRules.map(
                        (rule: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="text-cyan-400 font-bold mt-0.5 flex-shrink-0">
                              •
                            </span>
                            <span className="text-gray-300 text-sm leading-relaxed">
                              {rule}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* Rounds for AutoCAD */}
                {selectedCompetition.rounds && (
                  <div className="mb-6">
                    <h4 className="text-lg font-bold mb-4 text-cyan-400 border-b-2 border-blue-500/30 pb-2">
                      COMPETITION ROUNDS
                    </h4>
                    {Object.entries(selectedCompetition.rounds).map(
                      ([group, roundsList]: [string, any]) => (
                        <div key={group} className="mb-5">
                          <p className="font-semibold text-blue-400 mb-3 text-sm">
                            {group}
                          </p>
                          <ul className="space-y-2 ml-4">
                            {roundsList.map((round: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <span className="text-cyan-300 font-bold mt-0.5 flex-shrink-0">
                                  ◦
                                </span>
                                <span className="text-gray-300 text-sm">
                                  {round}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Note Section */}
                {selectedCompetition.note && (
                  <div className="mb-6 bg-blue-500/10 border-l-4 border-cyan-400 p-4 rounded-lg">
                    <h4 className="text-base font-bold mb-3 text-cyan-400">
                      Note:
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedCompetition.note).map(
                        ([key, value]: [string, any]) => (
                          <p key={key} className="text-gray-300 text-sm">
                            <span className="font-semibold text-cyan-400">
                              {key}:
                            </span>{" "}
                            {value}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-gradient-to-r from-slate-900 to-black border-t border-blue-500/30 p-6 flex gap-3 justify-end">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 border-2 border-blue-400 text-blue-300 hover:bg-blue-400/10 hover:text-cyan-300 transition-all duration-300 font-semibold"
                  variant="outline"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleRegisterClick(selectedCompetition);
                    setIsModalOpen(false);
                  }}
                  className="px-8 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-cyan-500/50"
                >
                  Register Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section
        id="whatsapp-community"
        className="py-16 bg-gradient-to-b from-slate-950 via-black to-slate-950 relative overflow-hidden"
      >
        {/* Removed particles from this section for better performance */}
        <div className="absolute inset-0 -z-10">
          <SparklesCore
            background="transparent"
            minSize={0.5}
            maxSize={2}
            particleDensity={90}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={1.3}
          />
        </div>
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            WhatsApp Community
          </motion.h2>
          <motion.p
            className="mb-8 text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join our WhatsApp community for quick updates and announcements.
          </motion.p>
          <motion.a
            href="https://chat.whatsapp.com/Lfev9E9GC6fLsLqysc4zAw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white rounded-full font-semibold shadow-lg shadow-green-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <MessageCircle className="w-6 h-6" />
            Join WhatsApp Community
          </motion.a>
        </div>
      </section>

      {/* Contact Us Section - Council Members */}
      <section
        id="contact-us"
        className="py-16 bg-gradient-to-br from-slate-950 via-black to-slate-950 relative overflow-hidden"
      >
        {/* Sparkles Background */}
        <div className="absolute inset-0 -z-10 opacity-25">
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1.8}
            particleDensity={70}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={1}
          />
        </div>
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 left-10 w-24 h-24 border-2 border-primary/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 right-10 w-32 h-32 border-2 border-secondary/10 rounded-lg rotate-45"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-4"
            >
              Contact Us
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-gray-300 max-w-2xl mx-auto"
            >
              Reach out to our council members and coordinators for any queries
              or assistance
            </motion.p>
          </motion.div>

          {/* WhatsApp moved to its own section above */}

          {/* Council Members Grid */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {/* Swara Hande - Senior OCM Member */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6 }}
              className="group relative flex justify-center"
            >
              <Card className="card-premium overflow-hidden h-full transition-all duration-300 hover:shadow-2xl w-full max-w-[18rem]">
                <CardContent className="p-0">
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    <img
                      src="technocratz2.0/team/1.png"
                      alt="Swara Hande"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                      >
                        <Linkedin className="w-6 h-6" />
                      </motion.a>
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </motion.a>
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                      >
                        <Phone className="w-6 h-6" />
                      </motion.a>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gradient mb-2">
                      SWARA HANDE
                    </h3>
                    <p className="text-primary font-semibold mb-1">
                      Senior OCM Member
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Arush Wavhal - Asst. Technical Secretary */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative flex justify-center"
            >
              <Card className="card-premium overflow-hidden h-full transition-all duration-300 hover:shadow-2xl w-full max-w-[18rem]">
                <CardContent className="p-0">
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    <img
                      src="technocratz2.0/team/2.png"
                      alt="Arush Wavhal"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                      >
                        <Linkedin className="w-6 h-6" />
                      </motion.a>
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </motion.a>
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                      >
                        <Phone className="w-6 h-6" />
                      </motion.a>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gradient mb-2">
                      ARUSH WAVHAL
                    </h3>
                    <p className="text-primary font-semibold mb-1">
                      Asst. Technical Secretary
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Olivia Ojas - General Secretary */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative flex justify-center"
            >
              <Card className="card-premium overflow-hidden h-full transition-all duration-300 hover:shadow-2xl w-full max-w-[18rem]">
                <CardContent className="p-0">
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    <img
                      src="technocratz2.0/team/3.png"
                      alt="Olivia Ojas"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                      >
                        <Linkedin className="w-6 h-6" />
                      </motion.a>
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </motion.a>
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                      >
                        <Phone className="w-6 h-6" />
                      </motion.a>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gradient mb-2">
                      OLIVIA OJAS
                    </h3>
                    <p className="text-primary font-semibold mb-1">
                      General Secretary
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gauri Dhuri - Asst. Technical Secretary */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative flex justify-center"
            >
              <Card className="card-premium overflow-hidden h-full transition-all duration-300 hover:shadow-2xl w-full max-w-[18rem]">
                <CardContent className="p-0">
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    <img
                      src="technocratz2.0/team/4.png"
                      alt="Gauri Dhuri"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                      >
                        <Linkedin className="w-6 h-6" />
                      </motion.a>
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </motion.a>
                      <motion.a
                        href="#"
                        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                      >
                        <Phone className="w-6 h-6" />
                      </motion.a>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gradient mb-2">
                      GAURI DHURI
                    </h3>
                    <p className="text-primary font-semibold mb-1">
                      Asst. Technical Secretary
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Registration Section */}

      {/* Follow Us Section */}
      <section className="py-16 bg-gradient-to-br from-matte-hero to-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 30, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute top-20 left-20 w-32 h-32 border-2 border-primary/20 rounded-full"
          />
          <motion.div
            animate={{
              rotate: -360,
              y: [-10, 10, -10],
            }}
            transition={{
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute bottom-20 right-20 w-24 h-24 border-2 border-secondary/20 rounded-lg rotate-45"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-gradient mb-4"
            >
              Follow Us
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground mb-12"
            >
              Stay connected with us on social media for updates and highlights
            </motion.p>

            {/* Social Media Icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex justify-center gap-8 flex-wrap"
            >
              {/* Instagram */}
              <motion.a
                href="https://www.instagram.com/apv_council"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{
                  scale: 1.15,
                  rotate: [0, -10, 10, -10, 0],
                  y: -5,
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300">
                  <Instagram className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm font-semibold text-muted-foreground"
                >
                  Instagram
                </motion.div>
              </motion.a>

              {/* YouTube */}
              <motion.a
                href="https://youtube.com/@apvmedia0423?si=LX5WI8S6iWjqlG-1"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{
                  scale: 1.15,
                  rotate: [0, -5, 5, -5, 0],
                  y: -5,
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300">
                  <Youtube className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm font-semibold text-muted-foreground"
                >
                  YouTube
                </motion.div>
              </motion.a>

              {/* LinkedIn */}
              <motion.a
                href="https://www.linkedin.com/company/agnel-polytechnic-vashi-council"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{
                  scale: 1.15,
                  rotate: [0, 5, -5, 5, 0],
                  y: -5,
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300">
                  <Linkedin className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm font-semibold text-muted-foreground"
                >
                  LinkedIn
                </motion.div>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer
        id="contact"
        className="py-16 bg-gradient-to-b from-slate-950 via-black to-slate-950 text-white border-t border-blue-500/30"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mb-8"
          >
            {/* Organization Info */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
                <img
                  src={agnelLogo}
                  alt="Agnel Polytechnic Logo"
                  className="w-24 h-24 object-contain"
                />
                <img
                  src={technocratzLogo}
                  alt="TechnoCratz Logo"
                  className="w-28 h-28 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                APV TECHNOCRATZ
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm">
                <strong>
                  Technocratz 2.0 is organized by Agnel Polytechnic in
                  association with Institution's Innovation Council (IIC).
                </strong>
              </p>
            </motion.div>

            {/* Event Queries */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 text-cyan-400">
                For Event Queries
              </h4>
              <div className="space-y-6 text-sm">
                {/* Council Incharge */}
                <div className="mb-6">
                  <p className="font-bold text-white">MR. AMOL SURYAVANSHI</p>
                  <p className="text-gray-400">Council Incharge</p>
                  <p className="text-gray-500">8356999573</p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-white">SOHAM DHANOKAR</p>
                      <p className="text-gray-400">OCM Head</p>
                      <p className="text-gray-500">9321895202</p>
                    </div>
                    <div>
                      <p className="font-bold text-white">PARTH NAUKUDKAR</p>
                      <p className="text-gray-400">Technical Secretary</p>
                      <p className="text-gray-500">8828167334</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-white">OLIVIA OJAS</p>
                      <p className="text-gray-400">General Secretary</p>
                      <p className="text-gray-500">9967427007</p>
                    </div>
                    <div>
                      <p className="font-bold text-white">ARUSH WAVHAL</p>
                      <p className="text-gray-400">Asst. Technical Secretary</p>
                      <p className="text-gray-500">7977600390</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Location Map */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 text-cyan-400">
                Location
              </h4>
              <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-blue-500/30">
                <div className="h-48 w-full relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.731505954546!2d72.98870017502749!3d19.07553898212891!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c135baaaaaab%3A0x931cf32f3e166f1f!2sFr.%20Agnel%20Polytechnic!5e0!3m2!1sen!2sus!4v1758824121763!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Agnel Polytechnic Location"
                  ></iframe>
                </div>
                <div className="p-4 bg-slate-900/50">
                  <p className="text-gray-300 text-sm">
                    <MapPin className="w-4 h-4 inline mr-2 text-cyan-400" />
                    Agnel Polytechnic, Sector 9A, Vashi, Navi Mumbai,
                    Maharashtra 400703
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="border-t border-blue-500/30 pt-8 text-center">
            <p className="text-gray-400">
              © 2026 APV TECHNOCRATZ 2.0. All rights reserved. | Organized by
              Agnel Polytechnic & Institution's Innovation Council (IIC).
            </p>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <motion.button
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white p-3 rounded-full shadow-lg shadow-cyan-500/50 hover:shadow-xl transition-all duration-300 z-40"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      </footer>
    </div>
  );
};

export default Index;
