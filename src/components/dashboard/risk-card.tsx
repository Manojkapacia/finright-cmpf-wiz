import { AiOutlineExclamationCircle } from "react-icons/ai";
import { BiChevronRight } from "react-icons/bi";

type RiskLevel = "high" | "moderate" | "low" | "no risk";

interface RiskCardProps {
  riskPossibility?: string; 
  onClick?: () => void; // Added onClick type
}

const RiskCard: React.FC<RiskCardProps> = ({ riskPossibility = "", onClick }) => {
  const lowercaseRisk = riskPossibility.trim().toLowerCase() as RiskLevel;

  const isHighRisk = lowercaseRisk === "high";
  const riskType: RiskLevel = ["high", "moderate", "low", "no risk"].includes(lowercaseRisk)
    ? lowercaseRisk
    : "moderate"; // Default to "moderate" if invalid
    const riskMessages: Record<RiskLevel, React.ReactNode> = {
      high: (
        <>
          Your PF withdrawals are at  <span className="text-danger">High Risk </span> <br /> of  being  rejected  by EPFO.
        </>
      ),
      moderate: (
        <>
          Your PF withdrawals are at  <span className="text-warning">Moderate Risk </span> <br /> of  being  rejected  by EPFO.
        </>
      ),
      low: (
        <>
          Your PF withdrawals are at  <span className="text-success">Low Risk </span> <br /> of  being  rejected  by EPFO.
        </>
      ),
      "no risk": (
        <>
          Your PF withdrawals are at <span className="text-primary">No Risk </span> <br /> of  being  rejected  by EPFO.
        </>
      ),
    };
    
    

  const borderColor = isHighRisk ? "border-danger" : "border-warning";
  const textColor = isHighRisk ? "text-danger" : "text-warning";

  return (
    <div
    className={`card border ${borderColor} mb-3 position-relative`}
    style={{
      cursor: "pointer",
      minHeight: "9.375rem", // Ensures same height as the other card (150px)
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      paddingBottom: "1rem", // Ensures spacing for the bottom text
    }}
    onClick={onClick}
  >
    <div className="card-body" >
      <AiOutlineExclamationCircle className={`${textColor} fs-4`} style={{ marginTop: "-0.5rem"}} />
      <p className="cardTitle mb-0" style={{ fontWeight: 700 }}>
        {riskMessages[riskType]}
      </p>
      <p className="mb-0 cardBody">
        Find out how much of your PF is locked 
      </p>
    </div>
  
    <p className={`${textColor} mb-0 px-3`} style={{ fontSize: "0.8125rem" }}>
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
