"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  GraduationCap,
  Briefcase,
  Link2,
  X,
  Plus,
  Save,
  ArrowLeft,
  Sparkles,
  Building2,
  Users,
  Target,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ── Student profile steps ──
function StudentSkillsStep({ profile, setProfile, skillInput, setSkillInput, addSkill, removeSkill }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Your Skills</h2>
      <p className="text-muted-foreground text-sm mb-6">Add technologies and skills you&apos;re proficient in</p>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="e.g. React, Node.js, Python..."
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
        />
        <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-4">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {profile.skills.map((skill) => (
          <motion.span
            key={skill}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20"
          >
            {skill}
            <button onClick={() => removeSkill(skill)} className="hover:text-red-400">
              <X className="h-3 w-3" />
            </button>
          </motion.span>
        ))}
        {profile.skills.length === 0 && (
          <p className="text-muted-foreground text-sm">No skills added yet</p>
        )}
      </div>

      <div className="mt-6">
        <Label className="text-muted-foreground text-sm mb-1.5 block">Bio</Label>
        <Textarea
          placeholder="Tell us about yourself..."
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
        />
      </div>
    </div>
  );
}

function StudentEducationStep({ profile, setProfile }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Education</h2>
      <p className="text-muted-foreground text-sm mb-6">Add your educational background</p>
      <div className="space-y-4">
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Institution</Label>
          <Input
            placeholder="University or college name"
            value={profile.education.institution}
            onChange={(e) => setProfile({ ...profile, education: { ...profile.education, institution: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Degree</Label>
          <Input
            placeholder="e.g. B.Tech Computer Science"
            value={profile.education.degree}
            onChange={(e) => setProfile({ ...profile, education: { ...profile.education, degree: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Graduation Year</Label>
          <Input
            placeholder="e.g. 2025"
            value={profile.education.year}
            onChange={(e) => setProfile({ ...profile, education: { ...profile.education, year: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
      </div>
    </div>
  );
}

function StudentExperienceStep({ profile, setProfile }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Experience</h2>
      <p className="text-muted-foreground text-sm mb-6">Add your work experience (optional for freshers)</p>
      <div className="space-y-4">
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Company</Label>
          <Input
            placeholder="Company name"
            value={profile.experience.company}
            onChange={(e) => setProfile({ ...profile, experience: { ...profile.experience, company: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Role</Label>
          <Input
            placeholder="e.g. Software Developer Intern"
            value={profile.experience.role}
            onChange={(e) => setProfile({ ...profile, experience: { ...profile.experience, role: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Duration</Label>
          <Input
            placeholder="e.g. Jun 2024 - Present"
            value={profile.experience.duration}
            onChange={(e) => setProfile({ ...profile, experience: { ...profile.experience, duration: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
      </div>
    </div>
  );
}

function StudentLinksStep({ profile, setProfile }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Social Links</h2>
      <p className="text-muted-foreground text-sm mb-6">Add your online profiles</p>
      <div className="space-y-4">
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">GitHub</Label>
          <Input
            placeholder="https://github.com/username"
            value={profile.links.github}
            onChange={(e) => setProfile({ ...profile, links: { ...profile.links, github: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">LinkedIn</Label>
          <Input
            placeholder="https://linkedin.com/in/username"
            value={profile.links.linkedin}
            onChange={(e) => setProfile({ ...profile, links: { ...profile.links, linkedin: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Portfolio</Label>
          <Input
            placeholder="https://yoursite.com"
            value={profile.links.portfolio}
            onChange={(e) => setProfile({ ...profile, links: { ...profile.links, portfolio: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
      </div>
    </div>
  );
}

// ── Recruiter profile steps ──
function RecruiterCompanyStep({ profile, setProfile }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Company Information</h2>
      <p className="text-muted-foreground text-sm mb-6">Tell us about your organization</p>
      <div className="space-y-4">
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Company Name</Label>
          <Input
            placeholder="e.g. Google, TCS, Infosys..."
            value={profile.company?.name || ""}
            onChange={(e) => setProfile({ ...profile, company: { ...profile.company, name: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Industry</Label>
          <Input
            placeholder="e.g. Technology, Finance, Healthcare..."
            value={profile.company?.industry || ""}
            onChange={(e) => setProfile({ ...profile, company: { ...profile.company, industry: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Company Size</Label>
          <select
            value={profile.company?.size || ""}
            onChange={(e) => setProfile({ ...profile, company: { ...profile.company, size: e.target.value } })}
            className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground focus:border-blue-500 focus:outline-none transition-colors"
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1,000 employees</option>
            <option value="1000+">1,000+ employees</option>
          </select>
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Company Website</Label>
          <Input
            placeholder="https://yourcompany.com"
            value={profile.company?.website || ""}
            onChange={(e) => setProfile({ ...profile, company: { ...profile.company, website: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
      </div>
    </div>
  );
}

function RecruiterHiringStep({ profile, setProfile, roleInput, setRoleInput, addRole, removeRole }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Hiring Details</h2>
      <p className="text-muted-foreground text-sm mb-6">What roles are you currently hiring for?</p>
      <div className="space-y-4">
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Your Designation</Label>
          <Input
            placeholder="e.g. HR Manager, Technical Recruiter, CTO..."
            value={profile.designation || ""}
            onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Department</Label>
          <Input
            placeholder="e.g. Human Resources, Engineering..."
            value={profile.department || ""}
            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>

        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Roles You&apos;re Hiring For</Label>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="e.g. React Developer, DevOps Engineer..."
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRole()}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
            />
            <Button onClick={addRole} className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-4">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(profile.hiringRoles || []).map((role) => (
              <motion.span
                key={role}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-sm border border-violet-500/20"
              >
                {role}
                <button onClick={() => removeRole(role)} className="hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
            {(!profile.hiringRoles || profile.hiringRoles.length === 0) && (
              <p className="text-muted-foreground text-sm">No roles added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecruiterAboutStep({ profile, setProfile }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">About & Links</h2>
      <p className="text-muted-foreground text-sm mb-6">Additional details about your hiring process</p>
      <div className="space-y-4">
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">About / Hiring Message</Label>
          <Textarea
            placeholder="Tell candidates about your company culture, perks, and why they should join..."
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground min-h-[120px]"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">LinkedIn Company Page</Label>
          <Input
            placeholder="https://linkedin.com/company/yourcompany"
            value={profile.links?.linkedin || ""}
            onChange={(e) => setProfile({ ...profile, links: { ...profile.links, linkedin: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Careers Page</Label>
          <Input
            placeholder="https://yourcompany.com/careers"
            value={profile.links?.careers || ""}
            onChange={(e) => setProfile({ ...profile, links: { ...profile.links, careers: e.target.value } })}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──
export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [skillInput, setSkillInput] = useState("");
  const [roleInput, setRoleInput] = useState("");

  const [profile, setProfile] = useState({
    bio: "",
    // Student fields
    skills: [],
    education: { institution: "", degree: "", year: "" },
    experience: { company: "", role: "", duration: "" },
    links: { github: "", linkedin: "", portfolio: "" },
    // Recruiter fields
    company: { name: "", industry: "", size: "", website: "" },
    designation: "",
    department: "",
    hiringRoles: [],
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.user.profile && Object.keys(data.user.profile).length > 0) {
            setProfile((prev) => ({ ...prev, ...data.user.profile }));
          }
        }
      } catch { }
    }
    fetchUser();
  }, []);

  const isRecruiter = user?.role === "recruiter";

  // ─── Skill helpers (student) ───
  function addSkill() {
    const s = skillInput.trim();
    if (s && !profile.skills.includes(s)) {
      setProfile({ ...profile, skills: [...profile.skills, s] });
    }
    setSkillInput("");
  }

  function removeSkill(skill) {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  }

  // ─── Hiring role helpers (recruiter) ───
  function addRole() {
    const r = roleInput.trim();
    if (r && !(profile.hiringRoles || []).includes(r)) {
      setProfile({ ...profile, hiringRoles: [...(profile.hiringRoles || []), r] });
    }
    setRoleInput("");
  }

  function removeRole(role) {
    setProfile({ ...profile, hiringRoles: (profile.hiringRoles || []).filter((r) => r !== role) });
  }

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
        credentials: "include",
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          const role = user?.role || localStorage.getItem("role") || "student";
          router.push(`/dashboard/${role}`);
        }, 1000);
      }
    } catch { }
    setLoading(false);
  }

  // ─── Steps config based on role ───
  const studentSteps = [
    { label: "Skills", icon: Sparkles },
    { label: "Education", icon: GraduationCap },
    { label: "Experience", icon: Briefcase },
    { label: "Links", icon: Link2 },
  ];

  const recruiterSteps = [
    { label: "Company", icon: Building2 },
    { label: "Hiring", icon: Target },
    { label: "About & Links", icon: Globe },
  ];

  const steps = isRecruiter ? recruiterSteps : studentSteps;

  // ─── Render step content ───
  function renderStep() {
    if (isRecruiter) {
      switch (step) {
        case 0: return <RecruiterCompanyStep profile={profile} setProfile={setProfile} />;
        case 1: return <RecruiterHiringStep profile={profile} setProfile={setProfile} roleInput={roleInput} setRoleInput={setRoleInput} addRole={addRole} removeRole={removeRole} />;
        case 2: return <RecruiterAboutStep profile={profile} setProfile={setProfile} />;
        default: return null;
      }
    } else {
      switch (step) {
        case 0: return <StudentSkillsStep profile={profile} setProfile={setProfile} skillInput={skillInput} setSkillInput={setSkillInput} addSkill={addSkill} removeSkill={removeSkill} />;
        case 1: return <StudentEducationStep profile={profile} setProfile={setProfile} />;
        case 2: return <StudentExperienceStep profile={profile} setProfile={setProfile} />;
        case 3: return <StudentLinksStep profile={profile} setProfile={setProfile} />;
        default: return null;
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background py-12 px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(56,189,248,0.08),transparent_60%)] blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(139,92,246,0.08),transparent_60%)] blur-[100px]" />
      </div>
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground">
            {isRecruiter ? "Set Up Your Recruiter Profile" : "Complete Your Profile"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isRecruiter
              ? "Tell us about your company and hiring needs"
              : "Tell us about yourself to personalize your experience"}
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${step === i
                  ? "bg-gradient-to-r from-blue-600/20 to-violet-600/20 text-foreground border border-blue-500/30"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <s.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={`${isRecruiter ? "r" : "s"}-${step}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="glass-card rounded-2xl p-8">
            {renderStep()}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {step < steps.length - 1 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0"
                >
                  Next Step
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button
                  onClick={save}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : success ? (
                    "Saved! Redirecting..."
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Profile
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
