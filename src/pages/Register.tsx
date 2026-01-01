import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Users, CreditCard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { SparklesCore } from "@/components/SparklesCore";

interface TeamMember {
  name: string;
  branch: string;
  year: string;
  college: string;
  contactNumber?: string;
  alternateContactNumber?: string;
}

interface FormData {
  teamLeader: TeamMember;
  teamMembers: TeamMember[];
}

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    teamLeader: {
      name: "",
      branch: "",
      year: "",
      college: "",
      contactNumber: "",
      alternateContactNumber: "",
    },
    teamMembers: [],
  });

  // Try to get data from location.state first, then fallback to localStorage
  let competition = location.state?.competition;
  let maxParticipants = location.state?.maxParticipants || 1;
  let fee = location.state?.fee || 0;

  // Fallback to localStorage if state is not available
  if (!competition) {
    const storedData = localStorage.getItem("selectedCompetition");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        competition = parsed.competition;
        maxParticipants = parsed.maxParticipants || 1;
        fee = parsed.fee || 0;
      } catch (e) {
        console.error("Failed to parse stored competition data", e);
      }
    }
  }

  useEffect(() => {
    if (!competition) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Initialize team members array based on max participants
    const members = Array(maxParticipants - 1)
      .fill(null)
      .map(() => ({
        name: "",
        branch: "",
        year: "",
        college: "",
      }));
    setFormData((prev) => ({
      ...prev,
      teamMembers: members,
    }));
    setIsLoading(false);
  }, [competition, maxParticipants, navigate]);

  const handleTeamLeaderChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      teamLeader: {
        ...prev.teamLeader,
        [field]: value,
      },
    }));
  };

  const handleTeamMemberChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  const validateTeamLeader = () => {
    const {
      name,
      branch,
      year,
      college,
      contactNumber,
      alternateContactNumber,
    } = formData.teamLeader;
    if (!name || !branch || !year || !college || !contactNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields for team leader.",
        variant: "destructive",
      });
      return false;
    }
    if (!/^\d{10}$/.test(contactNumber)) {
      toast({
        title: "Error",
        description: "Contact number must be 10 digits.",
        variant: "destructive",
      });
      return false;
    }
    if (alternateContactNumber && !/^\d{10}$/.test(alternateContactNumber)) {
      toast({
        title: "Error",
        description: "Alternate contact number must be 10 digits.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateTeamMembers = () => {
    for (const member of formData.teamMembers) {
      if (!member.name || !member.branch || !member.year || !member.college) {
        toast({
          title: "Error",
          description:
            "Please fill in all required fields for all team members.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateTeamLeader()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateTeamMembers()) {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/");
    }
  };

  const handlePayment = () => {
    toast({
      title: "Success",
      description: `Registration submitted! Payment of Rs ${fee} is pending.`,
    });
    // Clear localStorage
    localStorage.removeItem("selectedCompetition");
    // Here you would integrate with a payment gateway
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel the registration? All data will be lost."
      )
    ) {
      // Clear localStorage
      localStorage.removeItem("selectedCompetition");
      navigate("/");
    }
  };

  if (isLoading || !competition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <SparklesCore
            background="#0f172a"
            minSize={0.4}
            maxSize={2}
            particleDensity={60}
            className="w-full h-full"
            particleColor="#60a5fa"
            speed={0.5}
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
            Loading Registration Form...
          </h1>
          <p className="text-gray-300">
            Please wait while we prepare your registration form.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12 relative overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0 -z-10">
        <SparklesCore
          background="#0f172a"
          minSize={0.4}
          maxSize={2}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#60a5fa"
          speed={0.5}
        />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2">
            Registration Form
          </h1>
          <p className="text-lg text-gray-300">
            {competition?.title || "Registration"}
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    step <= currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-gray-400"
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {step}
                </motion.div>
                {step < 3 && (
                  <div
                    className={`h-1 w-24 mx-2 transition-all duration-300 ${
                      step < currentStep ? "bg-blue-500" : "bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Team Leader</span>
            <span>Team Members</span>
            <span>Payment</span>
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-8 md:p-12">
            {/* Step 1: Team Leader Details */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Users className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Team Leader Details
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="leaderName"
                      className="text-base font-semibold mb-2 block"
                    >
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="leaderName"
                      placeholder="Enter team leader name"
                      value={formData.teamLeader.name}
                      onChange={(e) =>
                        handleTeamLeaderChange("name", e.target.value)
                      }
                      className="input-premium text-base"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="leaderBranch"
                        className="text-base font-semibold mb-2 block"
                      >
                        Branch <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="leaderBranch"
                        placeholder="e.g., CE, ME, AE"
                        value={formData.teamLeader.branch}
                        onChange={(e) =>
                          handleTeamLeaderChange("branch", e.target.value)
                        }
                        className="input-premium text-base"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="leaderYear"
                        className="text-base font-semibold mb-2 block"
                      >
                        Year of Study <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="leaderYear"
                        placeholder="e.g., 2K, 4K, 6K"
                        value={formData.teamLeader.year}
                        onChange={(e) =>
                          handleTeamLeaderChange("year", e.target.value)
                        }
                        className="input-premium text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="leaderCollege"
                      className="text-base font-semibold mb-2 block"
                    >
                      College Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="leaderCollege"
                      placeholder="Enter college name"
                      value={formData.teamLeader.college}
                      onChange={(e) =>
                        handleTeamLeaderChange("college", e.target.value)
                      }
                      className="input-premium text-base"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="leaderContact"
                      className="text-base font-semibold mb-2 block"
                    >
                      Contact Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="leaderContact"
                      placeholder="Enter 10-digit contact number"
                      value={formData.teamLeader.contactNumber}
                      onChange={(e) =>
                        handleTeamLeaderChange("contactNumber", e.target.value)
                      }
                      maxLength={10}
                      className="input-premium text-base"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="leaderAltContact"
                      className="text-base font-semibold mb-2 block"
                    >
                      Alternate Contact Number
                    </Label>
                    <Input
                      id="leaderAltContact"
                      placeholder="Enter 10-digit alternate contact number (optional)"
                      value={formData.teamLeader.alternateContactNumber}
                      onChange={(e) =>
                        handleTeamLeaderChange(
                          "alternateContactNumber",
                          e.target.value
                        )
                      }
                      maxLength={10}
                      className="input-premium text-base"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Team Members Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Users className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Team Members Details
                  </h2>
                </div>

                <div className="space-y-8">
                  {formData.teamMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>
                        No additional team members required for this
                        competition.
                      </p>
                    </div>
                  ) : (
                    formData.teamMembers.map((member, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-slate-700/30 rounded-xl border border-blue-500/20"
                      >
                        <h3 className="text-lg font-semibold text-blue-400 mb-4">
                          Member {index + 2}
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <Label
                              htmlFor={`member${index}Name`}
                              className="text-base font-semibold mb-2 block"
                            >
                              Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`member${index}Name`}
                              placeholder="Enter member name"
                              value={member.name}
                              onChange={(e) =>
                                handleTeamMemberChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="input-premium text-base"
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor={`member${index}Branch`}
                                className="text-base font-semibold mb-2 block"
                              >
                                Branch <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`member${index}Branch`}
                                placeholder="e.g., CE, ME, AE"
                                value={member.branch}
                                onChange={(e) =>
                                  handleTeamMemberChange(
                                    index,
                                    "branch",
                                    e.target.value
                                  )
                                }
                                className="input-premium text-base"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`member${index}Year`}
                                className="text-base font-semibold mb-2 block"
                              >
                                Year of Study{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`member${index}Year`}
                                placeholder="e.g., 2K, 4K, 6K"
                                value={member.year}
                                onChange={(e) =>
                                  handleTeamMemberChange(
                                    index,
                                    "year",
                                    e.target.value
                                  )
                                }
                                className="input-premium text-base"
                              />
                            </div>
                          </div>

                          <div>
                            <Label
                              htmlFor={`member${index}College`}
                              className="text-base font-semibold mb-2 block"
                            >
                              College Name{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`member${index}College`}
                              placeholder="Enter college name"
                              value={member.college}
                              onChange={(e) =>
                                handleTeamMemberChange(
                                  index,
                                  "college",
                                  e.target.value
                                )
                              }
                              className="input-premium text-base"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Payment Summary
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-slate-700/30 rounded-xl p-8 border border-blue-500/20">
                    <h3 className="text-lg font-semibold text-blue-400 mb-6">
                      Registration Summary
                    </h3>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center pb-4 border-b border-blue-500/20">
                        <span className="text-gray-400">Competition:</span>
                        <span className="font-semibold text-blue-300">
                          {competition?.title || "Registration"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-blue-500/20">
                        <span className="text-gray-400">Team Leader:</span>
                        <span className="font-semibold text-gray-200">
                          {formData.teamLeader.name}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-blue-500/20">
                        <span className="text-gray-400">
                          Total Participants:
                        </span>
                        <span className="font-semibold text-gray-200">
                          {maxParticipants}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <span className="text-lg font-bold text-blue-400">
                          Total Amount:
                        </span>
                        <span className="text-3xl font-bold text-cyan-400">
                          Rs {fee}
                        </span>
                      </div>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                      <p className="text-sm text-yellow-300">
                        <span className="font-semibold">Note:</span> Please
                        proceed to payment to complete your registration. You
                        will receive a confirmation email shortly.
                      </p>
                    </div>
                  </div>

                  {/* Team Details Review */}
                  <div className="bg-slate-700/30 rounded-xl p-6 border border-blue-500/20">
                    <h4 className="font-semibold text-blue-400 mb-4">
                      Registered Participants
                    </h4>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="font-semibold text-blue-300">
                          Team Leader: {formData.teamLeader.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {formData.teamLeader.branch} | Year:{" "}
                          {formData.teamLeader.year} |{" "}
                          {formData.teamLeader.college}
                        </p>
                      </div>
                      {formData.teamMembers.map((member, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-semibold text-blue-300">
                            Member {index + 2}: {member.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {member.branch} | Year: {member.year} |{" "}
                            {member.college}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between mt-12 pt-8 border-t border-blue-500/30">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-8 border-2 border-blue-400 text-blue-300 hover:bg-blue-400/10 hover:text-cyan-300 transition-all duration-300 font-semibold"
              >
                Cancel
              </Button>

              <div className="flex gap-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="px-8 border-2 border-blue-400 text-blue-300 hover:bg-blue-400/10 hover:text-cyan-300 transition-all duration-300 font-semibold"
                  >
                    Back
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="px-8 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-cyan-500/50"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handlePayment}
                    className="px-8 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-semibold hover:from-green-600 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-green-500/50"
                  >
                    Proceed to Payment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
