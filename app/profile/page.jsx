"use client";

import { useState } from "react";
import AnimatedCard from "@/components/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function Profile() {
  const [data, setData] = useState({
    skills: "",
    education: "",
    experience: "",
    links: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  function handlePic(e) {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function uploadPictureIfAny() {
    if (!image) return null;

    const formData = new FormData();
    formData.append("file", image);

    const res = await fetch("/api/user/upload-picture", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url;
  }

  async function save() {
    const profileImageUrl = await uploadPictureIfAny();

    await fetch("/api/user/update-profile", {
      method: "PATCH",
      body: JSON.stringify({
        skills: data.skills.split(","),
        education: data.education,
        experience: data.experience,
        links: data.links.split(","),
        profileImage: profileImageUrl,
      }),
    });

    const role = localStorage.getItem("role");
    window.location.href = `/dashboard/${role}`;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center px-4">
      <AnimatedCard>
        <h1 className="text-2xl font-semibold mb-6">Complete Your Profile</h1>

        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center mb-4">
          {preview && (
            <motion.img
              src={preview}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 rounded-full object-cover border border-white/20 shadow-md mb-2"
            />
          )}

          <Input type="file" accept="image/*" onChange={handlePic} />
        </div>

        {/* Inputs */}
        <Input
          placeholder="Skills (comma separated)"
          onChange={(e) => setData({ ...data, skills: e.target.value })}
        />

        <Input
          className="mt-3"
          placeholder="Education"
          onChange={(e) => setData({ ...data, education: e.target.value })}
        />

        <Textarea
          className="mt-3"
          placeholder="Experience"
          onChange={(e) => setData({ ...data, experience: e.target.value })}
        />

        <Input
          className="mt-3"
          placeholder="Portfolio / GitHub Links (comma separated)"
          onChange={(e) => setData({ ...data, links: e.target.value })}
        />

        {/* Buttons */}
        <Button className="w-full mt-6" onClick={save}>
          Save & Continue
        </Button>

        <Button
          variant="outline"
          className="w-full mt-3"
          onClick={() => {
            const role = localStorage.getItem("role");
            window.location.href = `/dashboard/student`;
          }}
        >
          Skip for Now
        </Button>
      </AnimatedCard>
    </div>
  );
}
