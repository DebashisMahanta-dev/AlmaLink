import React from "react";
import { Link } from "react-router-dom";

const LegalPage = ({ badge, title, intro, updatedOn, sections }) => {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="container">
          <div className="legal-hero__inner">
            <span className="legal-badge">{badge}</span>
            <h1>{title}</h1>
            <p>{intro}</p>
            {updatedOn ? <span className="legal-updated">Last updated: {updatedOn}</span> : null}
          </div>
        </div>
      </section>

      <section className="legal-content">
        <div className="container">
          <div className="legal-grid">
            {sections.map((section) => (
              <article className="legal-card" key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.items?.length ? (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>

          <div className="legal-back-link">
            <Link to="/about">Learn more about GCE Connect</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalPage;
