import React from "react";
import LegalPage from "./LegalPage";

const sections = [
  {
    title: "Acceptance of terms",
    paragraphs: [
      "By using GCE Connect, you agree to use the site responsibly and follow these terms. If you do not agree, please do not use the platform.",
      "These terms apply to all visitors, registered users, and contributors to the site.",
    ],
  },
  {
    title: "Account responsibilities",
    items: [
      "Provide accurate information when registering",
      "Keep your login credentials secure",
      "Use the platform only for lawful and respectful community activity",
      "Do not impersonate another person or misuse another member's account",
    ],
  },
  {
    title: "Content and conduct",
    paragraphs: [
      "You are responsible for the content you share on the platform. Posts, messages, and comments should remain professional and relevant to the community.",
      "We may remove content or restrict accounts that violate these terms, harm other users, or interfere with the platform's operation.",
    ],
  },
  {
    title: "Service changes",
    paragraphs: [
      "We may update, suspend, or discontinue features when needed to improve the service or maintain security.",
      "We may also revise these terms from time to time. Continued use of the website means you accept the updated version.",
    ],
  },
];

const TermsOfService = () => (
  <LegalPage
    badge="Terms of Service"
    title="Rules for using GCE Connect"
    intro="These terms explain how the website should be used and what we expect from every member of the community."
    updatedOn="April 19, 2026"
    sections={sections}
  />
);

export default TermsOfService;
