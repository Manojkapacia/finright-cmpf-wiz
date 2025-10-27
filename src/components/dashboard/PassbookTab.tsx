import { useEffect } from "react";
import { CiMoneyCheck1 } from "react-icons/ci";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import PfReport from "../../features/dashboard/page/pf-report";
import PassbookForPF from "../../features/dashboard/page/passbook";
import { useLocation } from "react-router-dom";
import { useTab } from "../context/TabContext";

const TabComponent = (props: any) => {
  const location = useLocation();
  const { activeTab, setActiveTab } = useTab(); // Use context

  useEffect(() => {
    if (location.state?.openTab === "passbook") {
      setActiveTab(location.state.openTab);
    }
  }, [location.state, setActiveTab]);

  const tabs = [
    {
      id: "pf-report",
      label: "PF Report",
      icon: <HiOutlineDocumentCheck />,
      component: <PfReport scrapingStatus={props?.scrapingStatus} type={props?.type} currentUanData={props?.currentUanData} setScrapingStatus={props?.setScrapingStatus} 
      otpHandling={props?.otpHandling} />,
    },
    {
      id: "passbook",
      label: "Passbook",
      icon: <CiMoneyCheck1 />,
      component: <PassbookForPF currentUanData={props?.currentUanData} 
      scrapingStatus={props?.scrapingStatus}
      type={props?.type}
      setScrapingStatus={props?.setScrapingStatus}
      otpHandling={props?.otpHandling}
       />,
    },
  ];

  return (
    <div className="d-flex flex-column">
      {/* Scroll to Top when Active Tab Changes */}
      <div className="flex-grow-1 overflow-auto" id="tabContent">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>

      {/* Fixed Bottom Tab Navigation */}
      <div
        className="d-flex p-2 rounded-pill  shadow-lg position-fixed"
        style={{
          bottom: "0.625rem",
          left: "50%",
          transform: "translateX(-50%)",
          width: "17rem",
          height: "3.4375rem",
          backgroundColor: "#F7F9FF",
          justifyContent: "space-between",
          opacity: 0.95,
          borderRadius: "6.25rem",
          boxShadow: "0rem 0.375rem 0.875rem rgba(0, 0, 0, 0.25)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="d-flex align-items-center justify-content-center btn rounded-pill"
            style={{
              backgroundColor: activeTab === tab.id ? "#00124F" : "transparent",
              width: activeTab === tab.id ? "9rem" : "8rem",
              height: "3.25rem",
              marginTop: activeTab === tab.id ? "-0.4rem" : "-0.4rem",
              marginLeft: activeTab === tab.id ? "-0.4rem" : "-0.4rem",
              marginRight: activeTab === tab.id ? "-0.4rem" : "-0.4rem",
              border:"none",
              padding: "0.5rem",
              transition: "all 0.3s ease-in-out",
              boxShadow:
                activeTab === tab.id
                  ? "0rem 0.5rem 1rem rgba(0, 18, 79, 0.4)"
                  : "none",
            }}
            onClick={() => {
              setActiveTab(tab.id);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span
              className="d-flex align-items-center justify-content-center"
              style={{
                fontSize: "1rem",
                marginTop:"0.2rem",
                marginRight: "0.3rem",
                color: activeTab === tab.id ? "white" : "#00124F",
              }}
            >
              {tab.icon}
            </span>

            <span
              className="fw-light"
              style={{
                color: activeTab === tab.id ? "white" : "#00124F",
                fontSize: "0.8125rem",
              }}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabComponent;
