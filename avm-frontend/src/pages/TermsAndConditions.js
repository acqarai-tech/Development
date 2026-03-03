import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={styles.wrapper}>
      <style>{responsiveCss}</style>

      {/* HEADER */}
      <div style={styles.header} className="tnc-header">
        <div style={styles.logoSection} onClick={() => navigate("/")}>
          <span style={{ color: "#B87333" }}>ACQ</span>
          <span style={{ color: "#111111" }}>AR</span>
        </div>

        <div style={styles.headerCenter} className="tnc-headerCenter">
          <h1 style={styles.pageTitle}>Terms & Conditions</h1>
          <p style={styles.effectiveDate}>Effective Date: January 2026</p>
        </div>

        <div className="tnc-spacer" style={{ width: "80px" }} />
      </div>

      {/* CONTENT */}
      <div style={styles.contentWrapper} className="tnc-contentWrapper">
        <div style={styles.container} className="tnc-container">

          <Section title="1. Eligibility">
            You must be at least 18 years old to use AQCAR Services. By using
            the platform, you confirm that you have the legal capacity to enter
            into a legally binding agreement under applicable laws.
          </Section>

          <Section title="2. Nature of Services">
            AQCAR provides AI-powered real estate data, analytics, valuation
            insights, and informational tools including TruValu, TruCheck,
            ValuCheck, analytics tools, and related applications.
            <br /><br />
            <strong>Important Disclaimer:</strong>
            <ul>
              <li>AQCAR is not a licensed real estate broker or financial advisor unless explicitly stated.</li>
              <li>All outputs are informational and indicative only.</li>
              <li>Independent professional advice is recommended before decisions.</li>
            </ul>
          </Section>

          <Section title="3. No Professional Advice">
            All valuations, forecasts, analytics, reports, and insights are
            provided for informational purposes only and do not constitute
            legal, financial, investment, or certified valuation advice.
          </Section>

          <Section title="4. User Accounts">
            You agree to:
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain confidentiality of credentials</li>
              <li>Be responsible for account activity</li>
            </ul>
            We may suspend accounts in case of misuse or violations.
          </Section>

          <Section title="5. AI & Data Models">
            AQCAR uses artificial intelligence and third-party data. Outputs
            may contain inaccuracies and future performance is not guaranteed.
          </Section>

          <Section title="6. Data Sources">
            Data may originate from public records, third-party providers,
            proprietary datasets, and user inputs. Accuracy is not guaranteed.
          </Section>

          <Section title="7. Free & Paid Services">
            We may modify pricing, features, or promotions at any time.
            Payments are non-refundable unless stated otherwise.
          </Section>

          <Section title="8. Intellectual Property">
            All trademarks, algorithms, reports, and designs are property of
            AQCAR and protected by intellectual property laws.
          </Section>

          <Section title="9. Acceptable Use">
            You may not misuse, scrape, reverse-engineer, or misrepresent
            platform outputs.
          </Section>

          <Section title="10. Third-Party Services">
            AQCAR is not responsible for third-party integrations or
            transactions conducted outside the platform.
          </Section>

          <Section title="11. Limitation of Liability">
            AQCAR is not liable for financial losses, investment decisions,
            or reliance on AI-generated insights.
          </Section>

          <Section title="12. Indemnification">
            You agree to indemnify AQCAR against claims arising from misuse
            of the platform.
          </Section>

          <Section title="13. Data Privacy">
            Use of AQCAR is governed by our Privacy Policy.
          </Section>

          <Section title="14. Service Availability">
            We do not guarantee uninterrupted or error-free access.
          </Section>

          <Section title="15. Modifications">
            Continued use after updates constitutes acceptance of revised Terms.
          </Section>

          <Section title="16. Governing Law">
            These Terms are governed by the laws of the United Arab Emirates.
          </Section>

          <Section title="17. Contact Information">
            Email:{" "}
            <a href="mailto:support@acqar.com" style={styles.link}>
              support@aqcar.com
            </a>
            <br />
            Website:{" "}
            <a href="http://www.acqar.com/" target="_blank" rel="noopener noreferrer" style={styles.link}>
              www.aqcar.com
            </a>
          </Section>

          <Section title="18. Acknowledgment">
            By using AQCAR, you acknowledge that you have read and agreed to
            these Terms.
          </Section>

          {/* Bottom padding so last section isn't cut off */}
          <div style={{ height: 24 }} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitleRow}>
        <span style={styles.sectionDot} />
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>
      <div style={styles.sectionContent}>{children}</div>
    </div>
  );
}

const responsiveCss = `
  /* Header responsive */
  @media (max-width: 640px) {
    .tnc-header {
      padding: 16px 20px !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    .tnc-headerCenter {
      text-align: center !important;
    }
    .tnc-spacer {
      display: none !important;
    }
  }

  /* Content wrapper responsive */
  @media (max-width: 768px) {
    .tnc-contentWrapper {
      padding: 20px 12px !important;
    }
    .tnc-container {
      padding: 24px 18px !important;
      height: auto !important;
      max-height: none !important;
      border-radius: 12px !important;
    }
  }

  /* List styling inside sections */
  .tnc-container ul {
    padding-left: 20px;
    margin: 10px 0;
  }
  .tnc-container ul li {
    margin-bottom: 6px;
    line-height: 1.8;
    color: #555;
  }

  /* Scrollbar styling for desktop */
  .tnc-container::-webkit-scrollbar {
    width: 6px;
  }
  .tnc-container::-webkit-scrollbar-track {
    background: #f9f9f9;
    border-radius: 10px;
  }
  .tnc-container::-webkit-scrollbar-thumb {
    background: #e2c9a8;
    border-radius: 10px;
  }
  .tnc-container::-webkit-scrollbar-thumb:hover {
    background: #B87333;
  }
`;

const styles = {
  wrapper: {
    backgroundColor: "#fafaf8",
    minHeight: "100vh",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 60px",
    borderBottom: "1px solid #eeece8",
    backgroundColor: "#ffffff",
    flexWrap: "wrap",
    gap: "10px",
    position: "sticky",
    top: 0,
    zIndex: 50,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  logoSection: {
    fontSize: "22px",
    fontWeight: "900",
    letterSpacing: "-1px",
    cursor: "pointer",
    userSelect: "none",
  },
  headerCenter: {
    textAlign: "center",
    flex: 1,
  },
  pageTitle: {
    fontSize: "18px",
    fontWeight: "800",
    margin: 0,
    color: "#1a1a1a",
    letterSpacing: "-0.01em",
  },
  effectiveDate: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#aaa",
    fontWeight: "500",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },

  contentWrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "36px 20px 48px",
  },

  container: {
    width: "100%",
    maxWidth: "860px",
    height: "75vh",
    maxHeight: "75vh",
    overflowY: "auto",
    padding: "40px 48px",
    border: "1px solid #eeece8",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
    backgroundColor: "#ffffff",
  },

  section: {
    marginBottom: "36px",
    paddingBottom: "28px",
    borderBottom: "1px solid #f5f3ef",
  },

  sectionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },

  sectionDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#B87333",
    flexShrink: 0,
    marginTop: "2px",
  },

  sectionTitle: {
    color: "#1a1a1a",
    fontSize: "15px",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "-0.01em",
  },

  sectionContent: {
    color: "#555",
    fontSize: "14px",
    lineHeight: "1.85",
    paddingLeft: "16px",
    borderLeft: "2px solid #f5ece0",
  },

  link: {
    color: "#B87333",
    fontWeight: "700",
    textDecoration: "none",
    borderBottom: "1.5px solid rgba(184,115,51,0.35)",
    paddingBottom: "1px",
    wordBreak: "break-word",
    transition: "border-color 0.2s",
  },
};
