import React from "react";
import LegalPage from "./LegalPage";

const sections = [
  {
    title: "Information we collect",
    paragraphs: [
      "We collect the information you provide when you create an account, update your profile, post content, or contact other members.",
      "This may include your name, email address, academic details, profile photo, job preferences, and any messages you send through the platform.",
    ],
  },
  {
    title: "How we use information",
    items: [
      "Create and manage your account",
      "Help students and alumni connect with each other",
      "Send important notifications about the platform",
      "Improve features, safety, and support",
    ],
  },
  {
    title: "Sharing and disclosure",
    paragraphs: [
      "Your profile information may be visible to other authenticated members depending on your account settings and role.",
      "We do not sell personal information. We may disclose data when required to protect the platform, comply with law, or respond to valid requests.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: [
      "You can update your profile information at any time. You may also contact the administrators if you want help with data access or account removal.",
      "If you do not want to receive non-essential communications, you can adjust your notification preferences where available.",
    ],
  },
];

const PrivacyPolicy = () => (
  <LegalPage
    badge="Privacy Policy"
    title="How we handle your information"
    intro="This page explains how GCE Connect collects, uses, and protects member information across the website."
    updatedOn="April 19, 2026"
    sections={sections}
  />
);

export default PrivacyPolicy;
