// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { get } from "../../components/common/api";
// import moment from "moment";
// import { ArrowLeft } from "react-bootstrap-icons";
// import SidebarLayout from "../SidebarLayout";

// // ✅ Type for individual summary item
// type SummaryItem = {
//     successRate: number;
//     avgProcessTime: number;
//     total: number;
//     successCount: number;
//     failureCount: number;
//     extraStats: any
// };

// // ✅ Type for the full API data
// type ScrapStatsResponse = {
//     lastUpdated: string;
//     period: string;
//     summaries: {
//         [key: string]: SummaryItem;
//     };
// };

// function MonitoringOpsDashboard() {
//     const [scrapStatsResult, setScrapStatsResult] = useState<ScrapStatsResponse | null>(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         fetchScrapStats();
//     }, []);

//     const fetchScrapStats = async () => {
//         try {
//             const response = await get("/data/scrap/hourlySummary");

//             // Assume `response.data` is the main object
//             setScrapStatsResult(response.data);
//         } catch (err) {
//             console.error("Failed to fetch scrap stats:", err);
//         }
//     };

//     const summaries = scrapStatsResult?.summaries || {};

//     function formatOperationName(key: string): string {
//         const lowerKey = key.toLowerCase();
    
//         if (lowerKey === "otp") return "Post OTP (scrapper)";
//         if (lowerKey === "login") return "EPFO Login";
    
//         // Insert spaces before capital letters and trim
//         const withSpaces = key.replace(/([a-z])([A-Z])/g, '$1 $2');
    
//         // Capitalize first letter
//         return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
//     }

//     function formatSubTypeName(key: string): any {
//         const lowerKey = key.toLowerCase();
        
//         if (lowerKey === "invaliduan") return "Invalid UAN / Password";
//         if (lowerKey === "epfoissue") return "EPFO Issue";
//         if (lowerKey === "attemptfailed") return "All Retries Failure";
//         if (lowerKey === "captchafailed") return "Captcha Failure"
//     }

//     const formatStatsToList = (stats:any) => {
//         return (
//             <ul>
//             {Object.entries(stats).map(([key, value]) => (
//                 <li key={key}>
//                     <strong>{formatSubTypeName(key)}:</strong> {String(value)}
//                 </li>
//             ))}
//             </ul>
//         );
//     };

//     return (
//         <SidebarLayout>
//         <div className="container mt-4">
//             <div className="row">
//                 <div className="col-md-10 offset-md-1">
//                     {!scrapStatsResult ? (
//                         <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
//                             <div className="text-center p-4 bg-white rounded shadow">
//                                 <div className="spinner-border text-primary" role="status">
//                                     <span className="visually-hidden">Loading...</span>
//                                 </div>
//                                 <p className="mt-3">Fetching Data, Please wait...</p>
//                             </div>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
//                                 <button
//                                     className="btn p-0 d-flex align-items-center"
//                                     onClick={() => navigate("/operation/view-details")}
//                                 >
//                                     <ArrowLeft size={20} className="me-1" /> Back
//                                 </button>
//                                 <p className="mb-0">
//                                     Last Updated:{" "}
//                                     <span className="text-danger" style={{fontWeight: 600}}>
//                                         {moment(scrapStatsResult.lastUpdated)
//                                             .local()
//                                             .format("MMMM Do YYYY, h:mm:ss A")}
//                                     </span>
//                                 </p>
//                             </div>
//                             <table className="table table-hover">
//                                 <thead className="table-light">
//                                     <tr>
//                                         <th style={{fontSize: '1rem'}}>Module</th>
//                                         <th style={{fontSize: '1rem'}}>Total Requests</th>
//                                         <th style={{fontSize: '1rem'}}>Success Count</th>
//                                         <th style={{fontSize: '1rem'}}>Failure Count</th>
//                                         <th style={{fontSize: '1rem'}}>Success Rate (%)</th>
//                                         <th style={{fontSize: '1rem'}}>Avg Process Time Success (sec)</th>
//                                         <th style={{fontSize: '1rem'}}>Issues Break-Down</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {Object.entries(summaries).map(([key, value]) => {
//                                         const stat = value as SummaryItem;
//                                         return (
//                                             <tr key={key}>
//                                                 <td style={{fontSize: '0.8rem'}}>{formatOperationName(key)}</td>
//                                                 <td style={{fontSize: '0.8rem'}}>{stat.total}</td>
//                                                 <td style={{fontSize: '0.8rem'}}>{stat.successCount}</td>
//                                                 <td style={{fontSize: '0.8rem'}}>{stat.failureCount}</td>
//                                                 <td style={{fontSize: '0.8rem'}}>{stat.successRate}</td>
//                                                 <td style={{fontSize: '0.8rem'}}>{stat.avgProcessTime}</td>
//                                                 <td style={{fontSize: '0.8rem'}}>{key == 'login' ? formatStatsToList(stat?.extraStats) : "-"}</td>
//                                             </tr>
//                                         );
//                                     })}
//                                 </tbody>
//                             </table>
//                         </>
//                     )}

//                 </div>
//             </div>
//         </div>
//         </SidebarLayout>
//     );
// }

// export default MonitoringOpsDashboard;

import { useEffect, useRef, useState } from "react";
import { get } from "../../components/common/api";
import moment from "moment";
// import { ArrowLeft } from "react-bootstrap-icons";
import SidebarLayout from "../SidebarLayout";
import { DateRange } from "react-date-range";
import 'react-date-range/dist/styles.css';       // main style file
import 'react-date-range/dist/theme/default.css'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';




type SummaryItem = {
  successRate: number;
  avgProcessTime: number;
  total: number;
  successCount: number;
  failureCount: number;
  extraStats?: any;
};


type ViewMode = "Current" | "HOUR_1" | "HOUR_3" | "HOUR_5" | "DATE_RANGE";
type SummaryPerHour = {
  [hourLabel: string]: {
    [module: string]: SummaryItem;
  };
};

function MonitoringOpsDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("Current");
  const [hourlyStats, setHourlyStats] = useState<SummaryPerHour>({});
  const [totalStats, setTotalStats] = useState<{ [module: string]: SummaryItem }>({});
  const [lastUpdated, setLastUpdated] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);
  // const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [summariesByDate, setSummariesByDate] = useState<{ [date: string]: { [module: string]: SummaryItem } }>({});
  const [showModuleDetails, setShowModuleDetails] = useState(false);
  const [dateRange, setDateRange] = useState<any>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [showGraphDetails, setShowGraphDetails] = useState(false);
  const [showHourSummary, setShowHourSummary] = useState(true);



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
  
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);
  
  useEffect(() => {
    if(viewMode === "DATE_RANGE") {
      setShowHourSummary(false);
      return;
    }
    setShowHourSummary(true);
    fetchScrapStats();
  }, [viewMode]);

  const fetchScrapStats = async () => {
    try {
      setIsLoading(true);
      setIsTableLoading(true);
      
      if (viewMode === "Current") {
        const res = await get("/data/scrap/hourlySummary");
        setTotalStats(res.data.summaries || {});
        setLastUpdated(res.data.lastUpdated);
        setHourlyStats({});
        setIsLoading(false);
        setIsTableLoading(false);
        setShowHourSummary(true);
        return;
      }
      if (viewMode === "DATE_RANGE") {
        const start = dateRange[0]?.startDate;
  const end = dateRange[0]?.endDate;
  if (!start|| !end) return;
  const startDateStr = moment(start).format("YYYY-MM-DD");
  const endDateStr = moment(end).format("YYYY-MM-DD");
       
      
        const res = await get(`/data/scrap/hourlySummary?startDate=${startDateStr}&endDate=${endDateStr}`);
        setSummariesByDate(res.data.summariesByDate || {});
        setTotalStats(res.data.totalSummary || {});
        setLastUpdated(res.data.lastUpdated);
        setHourlyStats({});
        setShowHourSummary(false);
        return;
      }
      

      const hourMap = { HOUR_1: 1, HOUR_3: 3, HOUR_5: 5 };
      const count = hourMap[viewMode];
      const now = new Date();
      const statsByHour: SummaryPerHour = {};
      const total: { [module: string]: SummaryItem } = {};

      for (let i = count; i >= 1; i--) {
        const targetHour = new Date(now);
        targetHour.setHours(now.getHours() - i, 0, 0, 0);
        const iso = targetHour.toISOString();
        const label = moment(targetHour).format("h A");

        const res = await get(`/data/scrap/hourlySummary?hourStart=${iso}`);
        const summaries = res.data?.summaries || {};
        statsByHour[label] = summaries;

        for (const [mod, stat] of Object.entries(summaries) as [string, SummaryItem][]) {
          if (!total[mod]) {
            total[mod] = { ...stat, extraStats: stat.extraStats || {} };
          } else {
            total[mod].total += stat.total;
            total[mod].successCount += stat.successCount;
            total[mod].failureCount += stat.failureCount;
            total[mod].avgProcessTime += stat.avgProcessTime;
            total[mod].extraStats = total[mod].extraStats || {};

            if (mod === "login" && stat.extraStats) {
              for (const k in stat.extraStats) {
                total[mod].extraStats[k] = (total[mod].extraStats[k] || 0) + stat.extraStats[k];
              }
            }
            if (mod === "generateFinrightOtp" && stat.extraStats) {
              for (const k in stat.extraStats) {
                total[mod].extraStats[k] = (total[mod].extraStats[k] || 0) + stat.extraStats[k];
              }
            }
            if (mod === "confirmFinrightOtp" && stat.extraStats) {
              for (const k in stat.extraStats) {
                total[mod].extraStats[k] = (total[mod].extraStats[k] || 0) + stat.extraStats[k];
              }
            }
            if (mod === "otp" && stat.extraStats) {
              for (const k in stat.extraStats) {
                total[mod].extraStats[k] = (total[mod].extraStats[k] || 0) + stat.extraStats[k];
              }
            }
            if (mod === "employmentHistory" && stat.extraStats) {
              for (const k in stat.extraStats) {
                total[mod].extraStats[k] = (total[mod].extraStats[k] || 0) + stat.extraStats[k];
              }
            }
            if (mod === "passbook" && stat.extraStats) {
              for (const k in stat.extraStats) {
                total[mod].extraStats[k] = (total[mod].extraStats[k] || 0) + stat.extraStats[k];
              }
            }
            if (mod === "singleUan" && stat.extraStats) {
              for (const k in stat.extraStats) {
                total[mod].extraStats[k] = (total[mod].extraStats[k] || 0) + stat.extraStats[k];
              }
            }
            if (mod === "uanList" && stat.extraStats) {
              for (const k in stat.extraStats) {
                total[mod].extraStats[k] = (total[mod].extraStats[k] || 0) + stat.extraStats[k];
              }
            }
            if (mod === "knowlarityLog" && stat.extraStats) {
              for (const k in stat.extraStats) {
                total[mod].extraStats[k] = (total[mod].extraStats[k] || 0) + stat.extraStats[k];
              }
            }

          }
        }
      }


      for (const mod in total) {
        const t = total[mod];
        t.successRate = t.total ? parseFloat(((t.successCount / t.total) * 100).toFixed(2)) : 0;
        t.avgProcessTime = t.successCount ? parseFloat((t.avgProcessTime / t.successCount).toFixed(2)) : 0;
      }

      setHourlyStats(statsByHour);
      setTotalStats(total);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error("Failed to fetch scrap stats:", err);
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
    }
  };

  const formatOperationName = (key: string): string => {
    const lower = key.toLowerCase();
    if (lower === "otp") return "Post OTP (scrapper)";
    if (lower === "login") return "EPFO Login";
    return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
  };

  const formatSubTypeName = (key: string): string => {
    const map: any = {
      invaliduan: "Invalid UAN / Password",
      epfoissue: "EPFO Issue",
      attemptfailed: "All Retries Failure",
      captchafailed: "Captcha Failure",

      technicalerror: "Technical Error",
      missingmobilenumber: "Missing Mobile Number",
      otpsenderrorfromarhihant: "Arhihant Issues",
  
      invalidotp: "Invalid OTP",
      missingmobilenumberotp: "Missing Mobile Number (OTP)",
      technicalerrorotp: "Technical Error",
  
      scrappingissue: "Scrapping Issue",

      passbookapifailed: "Passbook API Failed",
      technicalerrorpassbook: "Technical Error ",

      technicalerroruanlist: "Technical Error ",
      technicalerrorsingleuan: "Technical Error ",
      technicalerroremploymenthistory: "Technical Error",

      technicalerrorknowlarity: "Technical Error",
      noagentavailable: "No Agent Available",
      failedtomakecall: "Failed To Make Call",
  
    };
    return map[key.toLowerCase()] || key;
  };

  const formatStatsToList = (stats: any) => (
    <ul className="mb-0 ps-3">
      {Object.entries(stats).map(([k, v]) => (
        <li key={k}>
          <strong>{formatSubTypeName(k)}:</strong> {String(v)}
        </li>
      ))}
    </ul>
  );
  const getChartData = () => {
    return Object.entries(totalStats).map(([mod, stat]) => ({
      name: formatOperationName(mod),
      total: stat.total,
      successCount: stat.successCount,
      failureCount: stat.failureCount
    }));
  };
  
  const isDataEmpty = () => {
    const stats = totalStats;
    if (!stats || Object.keys(stats).length === 0) return true;
  
    return Object.values(stats).every(
      (s) => s.total === 0 && s.successCount === 0 && s.failureCount === 0
    );
  };
  

  const renderTotalStatsChart = () => (
    <div className="mb-4">
      <h5>Visual Summary</h5>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={getChartData()}
          margin={{ top: 20, right: 40, left: 20, bottom: 80 }}
          barCategoryGap={30} // spacing between bar groups
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            interval={0} 
            angle={-40} 
            textAnchor="end" 
            height={100} 
            tick={{ fontSize: 13 }}
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#8884d8" name="Total Requests" />
          <Bar dataKey="successCount" fill="#82ca9d" name="Success" />
          <Bar dataKey="failureCount" fill="#ff6961" name="Failure" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  
  
  
  const renderTabs = () => (
    <div className="mb-2 d-flex justify-content-end gap-2 flex-wrap position-relative">
      {["Current", "HOUR_1", "HOUR_3", "HOUR_5" , "DATE_RANGE"].map((mode) => (
        <button
          key={mode}
          className={`btn btn-outline-primary p-1 ${viewMode === mode ? "active" : ""}`}
          style={{ fontSize: "0.85rem" }} 
          onClick={() => {setViewMode(mode as ViewMode)
            if (mode === "DATE_RANGE") {
              setShowCalendar(true);
            }
          }
          }
          
        >
          {{
            Current: "CURRENT",
            HOUR_1: "Last 1 Hr",
            HOUR_3: "Last 3 Hr",
            HOUR_5: "Last 5 Hr",
            DATE_RANGE: "Date Range"
          }[mode]}
        </button>
      ))}
      {viewMode === "DATE_RANGE" && showCalendar && (
   <div
   ref={calendarRef}
   className="position-absolute z-3 bg-white border rounded shadow mt-2"
   style={{ top: "100%", right: 0 }}
 >
   <div className="p-3">
     <DateRange
       editableDateInputs={true}
       onChange={(item) => setDateRange([item.selection])}
       moveRangeOnFirstSelection={false}
       ranges={dateRange}
       maxDate={new Date()}
     />
     <div className="d-flex justify-content-end mt-2">
       <button
         className="btn btn-primary"
         onClick={() => {
           setShowCalendar(false);
           fetchScrapStats(); // triggers API fetch with selected date range
         }}
       >
         Done
       </button>
     </div>
   </div>
 </div>

    )}
    </div>
  );

  const renderTotalTable = () => (
          <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>Module</th>
            <th>Total Requests</th>
            <th>Success Count</th>
            <th>Failure Count</th>
            <th>Success Rate (%)</th>
            <th>Avg Process Time (sec)</th>
            <th>Issues Breakdown</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(totalStats).map(([mod, stat]) => {
           let extraStatsDisplay: React.ReactNode = "-"; 

           if (stat.extraStats) {
            const extraStats = stat.extraStats;
            const keysToShowMap: Record<string, string[]> = {
              generateFinrightOtp: ["technicalError", "missingMobileNumber", "otpSendErrorFromArhihant"],
              confirmFinrightOtp: ["invalidOtp", "missingMobileNumberOtp", "technicalErrorotp"],
              login: ["attemptFailed", "captchaFailed", "epfoIssue", "invalidUan"],              
              otp: ["invalidotp", "scrappingIssue"],
              employmentHistory : ["technicalErrorEmploymentHistory"],
              passbook : ["passbookApiFailed", "technicalErrorPassbook"],
              singleUan : ["technicalErrorSingleUan"],
              uanList : ["technicalErrorUanList"],
              knowlarityLog : ["technicalErrorKnowlarity", "noAgentAvailable", "failedToMakeCall"]
            };
          
            const keysToShow = keysToShowMap[mod] || [];
            const filteredStats = Object.fromEntries(
              keysToShow.map((key) => [key, extraStats[key] ?? 0])
            );
            extraStatsDisplay = formatStatsToList(filteredStats);
          }
          
            return (
            <tr key={mod}>
              <td>{formatOperationName(mod)}</td>
              <td>{stat.total}</td>
              <td>{stat.successCount}</td>
              <td>{stat.failureCount}</td>
              <td>{stat.successRate}</td>
              <td>{stat.avgProcessTime}</td>
              <td>{extraStatsDisplay}</td>
            </tr>
          )})}
        </tbody>
      </table>
  );
  const getFilteredExtraStats = (mod: string, extraStats: any) => {
    if (!extraStats) return "-";
  
    const keysToShowMap: Record<string, string[]> = {
      generatefinrightotp: ["technicalError", "missingMobileNumber", "otpSendError"],
      confirmfinrightotp: ["invalidOtp", "missingMobileNumberOtp", "technicalErrorotp"],
      login: ["attemptFailed", "captchaFailed", "epfoIssue", "invalidUan"],
      otp: ["invalidotp", "scrappingIssue"],
      employmenthistory : ["technicalErrorEmploymentHistory"],
      passbook : ["passbookApiFailed", "technicalErrorPassbook"],
      singleuan : ["technicalErrorSingleUan"],
      uanlist : ["technicalErrorUanList"],
      knowlaritylog : ["technicalErrorKnowlarity", "noAgentAvailable", "failedToMakeCall"]
    };
  
    const keysToShow = keysToShowMap[mod.toLowerCase()] || [];
    const filteredStats = Object.fromEntries(
      keysToShow.map((key) => [key, extraStats[key] ?? 0])
    );
    return formatStatsToList(filteredStats);
  };
  
  
  const getdateRangeStats = (mod: string, extraStats: any) => {
    if (!extraStats) return "-";
  
    const keysToShowMap: Record<string, string[]> = {
      generateFinrightOtp: ["Technical Error", "Missing Mobile Number", "OTP Send Error From Arhihant"],
      confirmFinrightOtp: ["Invalid OTP", "Missing Mobile Number/OTP", "Technical Error OTP"],
      login: ["All retries failed", "Captcha failed", "Epfo Issue", "Invalid UAN/Password"],
      otp: ["Invalid OTP", "Scraping issues"],
      employmentHistory : ["Technical Error EmploymentHistory"],
      passbook : ["Passbook API failed", "Technical Error Passbook"],
      singleUan : ["Technical Error SingleUan"],
      uanList : ["Technical Error UanList"],
      knowlarityLog : ["Technical Error Knowlarity", "No agent available", "Failed to make call"]

    };
  
    const keysToShow = keysToShowMap[mod] || [];
    const filteredStats = Object.fromEntries(
      keysToShow.map((key) => [key, extraStats[key] ?? 0])
    );
    return formatStatsToList(filteredStats);
  };
  const renderTransposedTable = () => {
    if (isTableLoading) {
      return ;
    }
    const hourLabels = Object.keys(hourlyStats);
    const modules = Object.keys(totalStats);
    const metrics = [
      { label: "Total Requests", key: "total" },
      { label: "Success Count", key: "successCount" },
      { label: "Failure Count", key: "failureCount" },
      { label: "Success Rate (%)", key: "successRate" },
      { label: "Avg Process Time (sec)", key: "avgProcessTime" },
      { label: "Issues Breakdown", key: "extraStats" },
    ];

    return (
      <>
        {modules.map((mod) => (
          <div key={mod} className="mb-4">
            <h6>{formatOperationName(mod)}</h6>
            <table className="table table-bordered table-sm"
            style={{ tableLayout: "fixed", width: "100%" }}
            >
            
              <thead className="table-light">
                <tr>
                  <th
                  style={{ width: "14%", whiteSpace: "nowrap" }}
                  >Metric ↓ / Hour →</th>

                  {hourLabels.map((hr) => {
                    const start = moment(hr, "h A");
                    const end = moment(start).add(1,"hour");
                    return (
                      <th key={hr}>
                        {start.format("h A")} - {end.format("h A")}
                      </th>
                    );
                  })}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.key}>
                    <td>{m.label}</td>
                    {hourLabels.map((hr) => {
                      const val = hourlyStats[hr]?.[mod]?.[m.key as keyof SummaryItem];
                      return (
                        <td key={hr}>
                           {m.key === "extraStats"
                          ? getFilteredExtraStats(mod, val)
                          : typeof val === "number"
                          ? val
                          : "-"}
                        </td>
                      );
                    })}
                    <td>
                    {m.key === "extraStats"
                      ? getFilteredExtraStats(mod, totalStats[mod]?.extraStats)
                      : totalStats[mod]?.[m.key as keyof SummaryItem]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </>
    );
  };

  const renderTotalSummaryTable = () => {
    if (isTableLoading) {
      return;
    }
  
    return (
      <div className="mb-4">
        <h5>Total Summary</h5>
        <table className="table table-hover table-sm">
          <thead className="table-light">
            <tr>
              <th>Module</th>
              <th>Total Requests</th>
              <th>Success Count</th>
              <th>Failure Count</th>
              <th>Success Rate (%)</th>
              <th>Avg Process Time (sec)</th>
              <th>Issues Breakdown</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(totalStats).map(([mod, stat]) => {

let extraStatsDisplay: React.ReactNode = "-"; 
if(showHourSummary === true){
if (stat.extraStats) {
 const extraStats = stat.extraStats;
 const keysToShowMap: Record<string, string[]> = {
   generateFinrightOtp: ["technicalError", "missingMobileNumber", "otpSendErrorFromArhihant"],
   confirmFinrightOtp: ["invalidOtp", "missingMobileNumberOtp", "technicalErrorotp"],
   login: ["attemptFailed", "captchaFailed", "epfoIssue", "invalidUan"],
   otp: ["invalidotp", "scrappingIssue"],
   employmentHistory : ["technicalErrorEmploymentHistory"],
   passbook : ["passbookApiFailed", "technicalErrorPassbook"],
   singleUan : ["technicalErrorSingleUan"],
   uanList : ["technicalErrorUanList"],
   knowlarityLog : ["technicalErrorKnowlarity", "noAgentAvailable", "failedToMakeCall"]
 };

 const keysToShow = keysToShowMap[mod] || [];
 const filteredStats = Object.fromEntries(
   keysToShow.map((key) => [key, extraStats[key] ?? 0])
 );
 extraStatsDisplay = formatStatsToList(filteredStats);
}
}
             
else{
              if (stat.extraStats) {
                const extraStats = stat.extraStats;
            
                if (mod === "generateFinrightOtp") {
                  const keysToShow = ["Technical Error", "Missing Mobile Number", "OTP Send Error From Arhihant"];
                  const filteredStats = Object.fromEntries(
                    keysToShow.map((key) => [key, extraStats[key] ?? 0])
                  );
                  extraStatsDisplay = formatStatsToList(filteredStats);
                } else if (mod === "confirmFinrightOtp") {
                  const keysToShow = ["Invalid OTP", "Missing Mobile Number/OTP", "Technical Error OTP"];
                  const filteredStats = Object.fromEntries(
                    keysToShow.map((key) => [key, extraStats[key] ?? 0])
                  );
                  extraStatsDisplay = formatStatsToList(filteredStats);
                } else if (mod === "login") {
                  const keysToShow = ["All retries failed", "Captcha failed", "Epfo Issue", "Invalid UAN/Password"];
                  const filteredStats = Object.fromEntries(
                    keysToShow.map((key) => [key, extraStats[key] ?? 0])
                  );
                  extraStatsDisplay = formatStatsToList(filteredStats);
                }
                else if (mod === "otp") {
                  const keysToShow = ["Invalid OTP", "Scraping issues"];
                  const filteredStats = Object.fromEntries(
                    keysToShow.map((key) => [key, extraStats[key] ?? 0])
                  );
                  extraStatsDisplay = formatStatsToList(filteredStats);
                }
                else if (mod === "employmentHistory") {
                  const keysToShow = ["Technical Error EmploymentHistory"];
                  const filteredStats = Object.fromEntries(
                    keysToShow.map((key) => [key, extraStats[key] ?? 0])
                  );
                  extraStatsDisplay = formatStatsToList(filteredStats);
                }
                else if (mod === "passbook") {
                  const keysToShow = ["Passbook API failed", "Technical Error Passbook"];
                  const filteredStats = Object.fromEntries(
                    keysToShow.map((key) => [key, extraStats[key] ?? 0])
                  );
                  extraStatsDisplay = formatStatsToList(filteredStats);
                }
                else if (mod === "singleUan") {
                  const keysToShow = ["Technical Error SingleUan"];
                  const filteredStats = Object.fromEntries(
                    keysToShow.map((key) => [key, extraStats[key] ?? 0])
                  );
                  extraStatsDisplay = formatStatsToList(filteredStats);
                }
                else if (mod === "uanList") {
                  const keysToShow = ["Technical Error UanList"];
                  const filteredStats = Object.fromEntries(
                    keysToShow.map((key) => [key, extraStats[key] ?? 0])
                  );
                  extraStatsDisplay = formatStatsToList(filteredStats);
                }
                else if (mod === "knowlarityLog") {
                  const keysToShow = ["Technical Error Knowlarity", "No agent available", "Failed to make call"];
                  const filteredStats = Object.fromEntries(
                    keysToShow.map((key) => [key, extraStats[key] ?? 0])
                  );
                  extraStatsDisplay = formatStatsToList(filteredStats);
                }
              }}
              return (
              <tr key={mod}>
                <td>{formatOperationName(mod)}</td>
                <td>{stat.total ?? "-"}</td>
                <td>{stat.successCount ?? "-"}</td>
                <td>{stat.failureCount ?? "-"}</td>
                <td>{stat.successRate ?? "-"}</td>
                <td>{stat.avgProcessTime ?? "-"}</td>
                <td>{extraStatsDisplay}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    );
  };
  
  
  
  const renderDateRangeTables = () => {
    return Object.entries(summariesByDate).map(([date, modules]) => {
      return (
        <div key={date} className="mb-4">
          <h6 className="text-primary">{moment(date).format("MMMM Do, YYYY")}</h6>
          {/* render module-wise tables like renderTransposedTable does */}
          {Object.entries(modules).map(([mod, stat]) => (
            <table className="table table-sm table-bordered mt-2 w-100" key={mod}>
              <thead className="table-light">
                <tr>
                  <th colSpan={2}>{formatOperationName(mod)}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="w-50 text-nowrap">Total</td><td>{stat.total}</td></tr>
                <tr><td className="w-50 text-nowrap">Success Count</td><td>{stat.successCount}</td></tr>
                <tr><td className="w-50 text-nowrap">Failure Count</td><td>{stat.failureCount}</td></tr>
                <tr><td className="w-50 text-nowrap">Success Rate (%)</td><td>{stat.successRate}</td></tr>
                <tr><td className="w-50 text-nowrap">Avg Process Time (sec)</td><td>{stat.avgProcessTime}</td></tr>
                <tr><td className="w-50 text-nowrap">Issues Breakdown</td><td>{getdateRangeStats(mod, stat.extraStats)}</td></tr>
              </tbody>
            </table>
          ))}
        </div>
      );
    });
  };
  

  return (
    <SidebarLayout>
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-10 offset-md-1">
          {isLoading   ? (
                        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
                            <div className="text-center p-4 bg-white rounded shadow">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Fetching Data, Please wait...</p>
                            </div>
                        </div>
                    ) : (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="mb-1 mb-md-0 me-3">
                Last Updated:{" "}
                <span className="text-danger fw-semibold">
                  {moment(lastUpdated).local().format("MMMM Do YYYY, h:mm:ss A")}
                </span>
              </p>
              {!isLoading && renderTabs()}
            </div>
                    )}

            {/* {!isLoading && renderTabs()} */}
           
            {!isLoading && isDataEmpty() ? (
  <div className="text-center my-4 text-muted mt-4 fw-semibold">No Data Available</div>
) :(
            
            viewMode === "Current" ? 
            <>
            { !isLoading && renderTotalTable()}
            {!isLoading && renderTotalStatsChart()}
            </>
              : viewMode.startsWith("HOUR_") ? (
                <>
                  {renderTotalSummaryTable()}
                  {!isLoading && (
                    <>
                      <div className="d-flex gap-3 align-items-center mb-3">
                        <button
                          className="btn btn-link p-0 d-flex align-items-center"
                          onClick={() => {setShowModuleDetails(!showModuleDetails)
                            if (!showModuleDetails) setShowGraphDetails(false);
                          }}

                        >
                          {showModuleDetails ? "Hide Module Details" : "View Module Details"}
                        </button>

                        <button
                          className="btn btn-link p-0 d-flex align-items-center"
                          onClick={() => {setShowGraphDetails(!showGraphDetails)
                            if (!showGraphDetails) setShowModuleDetails(false);
                          }}
                        >
                          {showGraphDetails ? "Hide Graph Details" : "View Graph Details"}
                        </button>
                      </div>

                      {showModuleDetails && renderTransposedTable()}
                      {showGraphDetails && renderTotalStatsChart()}
                    </>
                  )}
                </>
              ) : viewMode === "DATE_RANGE" ? (
                <>
                  {renderTotalSummaryTable()}
                  {!isLoading && (
                      <>
                        <div className="d-flex gap-3 align-items-center mb-3">
                          <button
                            className="btn btn-link p-0 d-flex align-items-center"
                            onClick={() => {setShowModuleDetails(!showModuleDetails)
                              if (!showModuleDetails) setShowGraphDetails(false);
                            }
                            }
                          >
                            {showModuleDetails ? "Hide Module Details" : "View Module Details"}
                          </button>

                          <button
                            className="btn btn-link p-0 d-flex align-items-center"
                            onClick={() =>{ setShowGraphDetails(!showGraphDetails)
                            if (!showGraphDetails) setShowModuleDetails(false); 
                            }}
                          >
                            {showGraphDetails ? "Hide Graph Details" : "View Graph Details"}
                          </button>
                        </div>

                        {showModuleDetails && renderDateRangeTables()}
                        {showGraphDetails && renderTotalStatsChart()}
                      </>
                    )}
                </>
              ) : null)}


          </div>
        </div>
      </div>

    </SidebarLayout>
  );
}

export default MonitoringOpsDashboard;
