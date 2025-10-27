import { AiOutlineExclamationCircle } from "react-icons/ai";
import { BiChevronRight } from "react-icons/bi";

type RiskLevel = "high" | "moderate" | "low" | "no risk";

interface RiskCardProps {
  riskPossibility?: string;
  onClick?: () => void;
}

const RiskCard: React.FC<RiskCardProps> = ({ riskPossibility = "", onClick }) => {
  const lowercaseRisk = riskPossibility.trim().toLowerCase() as RiskLevel;

  // const isHighRisk = lowercaseRisk === "high";
  const riskType: RiskLevel = ["high", "moderate", "low", "no risk"].includes(lowercaseRisk)
    ? lowercaseRisk
    : "moderate";

  const riskColors: Record<RiskLevel, { text: string; border: string }> = {
    high: { text: "#FF0000", border: "#FF0000" },
    moderate: { text: "#FFA500", border: "#FFA500" },
    low: { text: "#34A853", border: "#34A853" },
    "no risk": { text: "#007BFF", border: "#007BFF" },
  };

  const riskMessages: Record<RiskLevel, React.ReactNode> = {
    high: (
      <>
        Your PF withdrawals are at{" "}
        <span style={{ color: riskColors.high.text }}>High Risk</span> <br />
        of being rejected by EPFO.
      </>
    ),
    moderate: (
      <>
        Your PF withdrawals are at{" "}
        <span style={{ color: riskColors.moderate.text }}>Moderate Risk</span> <br />
        of being rejected by EPFO.
      </>
    ),
    low: (
      <>
        Your PF withdrawals are at{" "}
        <span style={{ color: riskColors.low.text }}>Low Risk</span> <br />
        of being rejected by EPFO.
      </>
    ),
    "no risk": (
      <>
        Your PF withdrawals are at{" "}
        <span style={{ color: riskColors["no risk"].text }}>No Risk</span> <br />
        of being rejected by EPFO.
      </>
    ),
  };

  return (
    <div
      className="card mb-3 position-relative"
      style={{
        cursor: "pointer",
        minHeight: "9.375rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        paddingBottom: "1rem",
        backgroundColor: "#F7F9FF",
        borderRadius:"1rem",
        border: `1px solid ${riskColors[riskType].border}`,
      }}
      onClick={onClick}
    >
      <div className="card-body">
        <AiOutlineExclamationCircle
          className="fs-4"
          style={{ color: riskColors[riskType].text, marginTop: "-0.5rem" }}
        />
        <p className="cardTitle mb-0" style={{ fontWeight: 700 }}>
          {riskMessages[riskType]}
        </p>
        <p className="mb-0 cardBody">Find out how much of your PF is locked</p>
      </div>

      <p
        className="mb-0 px-3"
        style={{ fontSize: "0.8125rem", color: riskColors[riskType].text }}
      >
        View Details
      </p>

      <BiChevronRight
        size={30}
        className="fs-3 position-absolute text-secondary"
        style={{ top: "50%", right: "1rem", transform: "translateY(-50%)" }}
      />
    </div>
  );
};

export default RiskCard;
