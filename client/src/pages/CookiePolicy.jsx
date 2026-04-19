import React from "react";
import LegalPage from "./LegalPage";

const sections = [
  {
    title: "What cookies are",
    paragraphs: [
      "Cookies are small files stored in your browser that help websites remember preferences, keep sessions active, and measure performance.",
      "GCE Connect uses cookies and similar technologies to keep the experience smooth and secure.",
    ],
  },
  {
    title: "Types of cookies we may use",
    items: [
      "Essential cookies for login and session management",
      "Preference cookies to remember settings and choices",
      "Analytics cookies to understand how the site is used",
      "Security cookies to help protect the platform from abuse",
    ],
  },
  {
    title: "Managing cookies",
    paragraphs: [
      "Most browsers let you control or delete cookies through their settings. If you disable essential cookies, parts of the site may not work correctly.",
      "You can clear cookies at any time, but some preferences may need to be set again on your next visit.",
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      "We may update this policy if we add new features or change how the site works.",
      "Any changes will be reflected on this page, so checking it occasionally is a good idea.",
    ],
  },
];

const CookiePolicy = () => (
  <LegalPage
    badge="Cookie Policy"
    title="How cookies help the site work"
    intro="This policy explains the cookies and similar technologies used to support your experience on GCE Connect."
    updatedOn="April 19, 2026"
    sections={sections}
  />
);

export default CookiePolicy;
