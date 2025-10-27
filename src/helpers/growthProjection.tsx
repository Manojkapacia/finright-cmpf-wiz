const CONSTANTS = {
  RETIREMENT_AGE: 58,
  ANNUAL_INTEREST_RATE: 0.085,
  ONE_CRORE: 10000000,
  MONTHS_IN_YEAR: 12,
  DEFAULT_AGE: 30,
  MIN_WORKING_AGE: 18,
};


const calculateEPFOProjections = (epfoData:any) => {
  if (!epfoData) {
    return getDefaultResponse();
  }

  try {
    const startingAge = calculateStartingAge(epfoData);
    const currentAge = calculateCurrentAge(epfoData);

    // Safely get service history
    const serviceHistory = epfoData.serviceHistory?.history || [];
    const sortedHistory = [...serviceHistory].sort((a, b) => {
      const dateA:any = parseIndianDate(a?.details?.["Joining Date"]);
      const dateB :any= parseIndianDate(b?.details?.["Joining Date"]);
      return (dateA || new Date()) - (dateB || new Date());
    });

    // Calculate actual historical balance with enhanced data
    const historicalGrowth = calculateActualBalance(
      sortedHistory,
      epfoData.passbooks || {},
      currentAge,
      startingAge
    );

    // Get latest monthly contribution
    const latestContribution = getLatestMonthlyContribution(epfoData);

    // Calculate future projections with enhanced data
    const futureProjections = calculateFutureProjections(
      historicalGrowth.finalBalance,
      latestContribution,
      currentAge,
      historicalGrowth.yearWiseGrowth.length // Pass N counter
    );

    return {
      historicalGrowth,
      futureProjections,
      summary: {
        finalAmount: futureProjections.finalBalance,
        croreStatus: futureProjections.croreStatus,
        monthlyContribution: latestContribution,
        startingAge: startingAge,
      },
    };
  } catch (error) {
    console.error("Error in EPF calculations:", error);
    return getDefaultResponse();
  }
};

function calculateFutureProjections(
    currentBalance:any,
    monthlyContribution:any,
    currentAge:any,
    startingN:any
  ) {
    try {
      let balance = currentBalance || 0;
      let yearlyProjections = [];
      const yearsToRetirement = Math.max(
        0,
        CONSTANTS.RETIREMENT_AGE - (currentAge || CONSTANTS.DEFAULT_AGE)
      );
      
      // Ensure startingN is valid
      let n = typeof startingN === 'number' && startingN >= 0 ? startingN : 0;
  
      // Get current year
      const currentYear = new Date().getFullYear();
  
      for (let year = 1; year <= yearsToRetirement; year++) {
        const yearlyContribution = (monthlyContribution || 0) * CONSTANTS.MONTHS_IN_YEAR;
        balance = (balance + yearlyContribution) * (1 + CONSTANTS.ANNUAL_INTEREST_RATE);
        
        const projectedAge = currentAge + year;
        
        // Only add projection if age is valid
        if (projectedAge <= CONSTANTS.RETIREMENT_AGE) {
          yearlyProjections.push({
            type: 'P',
            age: projectedAge,
            n: n,
            year: currentYear + year,
            contribution: yearlyContribution,
            balance: Math.round(balance),
            openingBalance: balance - yearlyContribution // Add opening balance
          });
          n++;
        }
      }
  
      return generateProjectionStatus(
        balance,
        yearlyProjections,
        yearsToRetirement,
        monthlyContribution
      );
    } catch (error) {
      console.error("Error in future projections:", error);
      return getDefaultProjections();
    }
  }
  
  function calculateActualBalance(serviceHistory:any, passbooks:any, currentAge:any, startingAge:any) {
    if (!serviceHistory.length) {
      return {
        yearWiseGrowth: [],
        finalBalance: 0,
        currentAge: currentAge || CONSTANTS.DEFAULT_AGE,
      };
    }
  
    let totalBalance = 0;
    let yearWiseGrowth:any = [];
    let n = 0;
  
    // Get all transactions sorted by year
    const allTransactions:any = [];
    serviceHistory.forEach((employment:any) => {
      const memberId = employment?.details?.["Member Id"];
      if (!memberId || !passbooks[memberId]) return;
  
      Object.entries(passbooks[memberId] || {}).forEach(([year, yearData]) => {
        if (!yearData) return;
        allTransactions.push({
          year: parseInt(year),
          yearData,
        });
      });
    });
  
    // Sort transactions by year
    allTransactions.sort((a:any, b:any) => a.year - b.year);
  
    // Process transactions in chronological order
    allTransactions.forEach(({ year, yearData }:any) => {
      try {
        const yearlyContribution = safeGetYearlyContribution(yearData, year);
        const yearlyInterest = safeGetYearlyInterest(yearData);
  
        totalBalance += yearlyContribution + yearlyInterest;
  
        const age = startingAge + (year - allTransactions[0].year);
  
        yearWiseGrowth.push({
          type: 'A',
          age: age,
          n: n,
          year: year,
          contribution: yearlyContribution,
          interest: yearlyInterest,
          balance: totalBalance,
        });
        n++;
      } catch (error) {
        console.warn(`Error processing year ${year}:`, error);
      }
    });
  
    return {
      yearWiseGrowth: yearWiseGrowth,
      finalBalance: totalBalance,
      currentAge: currentAge || CONSTANTS.DEFAULT_AGE,
    };
  }

function calculateStartingAge(epfoData:any) {
  try {
    const dob = epfoData?.profile?.basicDetails?.dateOfBirth;
    const firstJoinDate =
      epfoData?.serviceHistory?.overview?.["Date of Joining"];

    if (dob && firstJoinDate && dob !== "-" && firstJoinDate !== "-") {
      const birthDate:any = parseIndianDate(dob);
      const joinDate:any = parseIndianDate(firstJoinDate);

      if (birthDate && joinDate) {
        // Calculate age when person started their first job and round it
        const startingAge = Math.round(
          (joinDate - birthDate) / (1000 * 60 * 60 * 24 * 365)
        );
        return startingAge > 0 ? startingAge : CONSTANTS.MIN_WORKING_AGE;
      }
    }

    return CONSTANTS.MIN_WORKING_AGE;
  } catch (error) {
    console.warn("Error calculating starting age:", error);
    return CONSTANTS.MIN_WORKING_AGE;
  }
}

function calculateCurrentAge(epfoData:any) {
  try {
    const dob = epfoData?.profile?.basicDetails?.dateOfBirth;
    if (dob && dob !== "-") {
      const birthDate:any = parseIndianDate(dob);
      if (birthDate && birthDate.getTime() < new Date().getTime()) {
        const date:any= new Date();
        const age = Math.round(
          (date - birthDate) / (1000 * 60 * 60 * 24 * 365)
        );
        return age > 0 ? age : CONSTANTS.DEFAULT_AGE;
      }
    }

    // If no DOB, try to calculate from service history
    const startingAge = calculateStartingAge(epfoData);
    const serviceHistory = epfoData?.serviceHistory;
    if (serviceHistory?.overview?.["Total Experience"]) {
      const experience = parseExperienceString(
        serviceHistory.overview["Total Experience"]
      );
      return Math.round(
        startingAge + experience.years + experience.months / 12
      );
    }

    return CONSTANTS.DEFAULT_AGE;
  } catch (error) {
    console.warn("Error calculating age:", error);
    return CONSTANTS.DEFAULT_AGE;
  }
}

function parseIndianDate(dateStr:any) {
  try {
    if (!dateStr || dateStr === "-") return null;

    // Handle different date formats
    if (dateStr.includes("-")) {
      const [day, month, year] = dateStr.split("-");
      const date = new Date(`${month}-${day}-${year}`);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  } catch {
    return null;
  }
}

function parseExperienceString(expStr:any) {
  try {
    if (!expStr) return { years: 0, months: 0, days: 0 };
    const matches = expStr.match(/(\d+) Years (\d+) Months (\d+) Days/);
    return {
      years: parseInt(matches?.[1] || 0),
      months: parseInt(matches?.[2] || 0),
      days: parseInt(matches?.[3] || 0),
    };
  } catch {
    return { years: 0, months: 0, days: 0 };
  }
}

function safeGetYearlyContribution(yearData:any, year:any) {
  try {
    const totalsKey = `Total Contributions for the year [ ${year} ]`;
    return (
      parseCurrencyString(yearData?.totals?.[totalsKey]?.employeeShare || "0") +
      parseCurrencyString(yearData?.totals?.[totalsKey]?.employerShare || "0")
    );
  } catch {
    return 0;
  }
}

function safeGetYearlyInterest(yearData:any) {
  try {
    return (
      parseCurrencyString(yearData?.interestDetails?.employeeShare || "0") +
      parseCurrencyString(yearData?.interestDetails?.employerShare || "0")
    );
  } catch {
    return 0;
  }
}

function getLatestMonthlyContribution(epfoData:any) {
  try {
    const latestEmployment = epfoData?.serviceHistory?.history?.[0];
    if (!latestEmployment) return 0;

    const memberId = latestEmployment.details?.["Member Id"];
    const passbook = epfoData?.passbooks?.[memberId];
    if (!passbook) return 0;

    const years = Object.keys(passbook)
      .map(Number)
      .filter((year) => !isNaN(year));
    if (!years.length) return 0;

    const latestYear = Math.max(...years);
    const transactions = passbook[latestYear]?.transactions || [];

    const latestContribution = transactions
      .filter((t:any) => t?.particulars?.includes("Cont."))
      .sort((a: any, b: any) => {
        const dateA:any = safeGetDate(a?.transactionDate);
        const dateB:any = safeGetDate(b?.transactionDate);
        return dateB - dateA; // Sorting in descending order
      })[0];

    if (latestContribution) {
      return (
        parseCurrencyString(latestContribution.employeeShare || "0") +
        parseCurrencyString(latestContribution.employerShare || "0")
      );
    }
  } catch (error) {
    console.warn("Error getting latest contribution:", error);
  }
  return 0;
}

function generateProjectionStatus(
  balance:any,
  yearlyProjections:any,
  yearsToRetirement:any,
  monthlyContribution:any
) {
  let croreStatus;
  if (balance >= CONSTANTS.ONE_CRORE) {
    const croreYear = yearlyProjections.find(
      (p:any) => p.balance >= CONSTANTS.ONE_CRORE
    );
    const achievementYear =
      croreYear?.year || new Date().getFullYear() + yearsToRetirement;
    const yearsToAchieve = achievementYear - new Date().getFullYear();

    croreStatus = `Congratulations! You're on track to become CrorePati in ${achievementYear} (${yearsToAchieve} years from now)`;
  } else {
    const shortfall = CONSTANTS.ONE_CRORE - balance;
    // const extraMonthlyNeeded = Math.ceil(
    //   shortfall / (yearsToRetirement * 12) / 1.085
    // );

    croreStatus =
      `Just missed becoming CrorePati by ${Math.round(shortfall)}`
  }

  return {
    yearlyProjections,
    finalBalance: Math.round(balance),
    croreStatus,
    projectedMonthlyRequired:
      (monthlyContribution || 0) +
      (balance < CONSTANTS.ONE_CRORE
        ? Math.ceil(
            (CONSTANTS.ONE_CRORE - balance) / (yearsToRetirement * 12) / 1.085
          )
        : 0),
  };
}

function safeGetDate(dateStr:any) {
  try {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split("-");
    const date = new Date(`${month}-${day}-${year}`);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch {
    return new Date();
  }
}

function getDefaultProjections() {
  return {
    yearlyProjections: [],
    finalBalance: 0,
    croreStatus: "Unable to calculate projections with the available data.",
    projectedMonthlyRequired: 0,
  };
}

function getDefaultResponse() {
  return {
    historicalGrowth: {
      yearWiseGrowth: [],
      finalBalance: 0,
      currentAge: CONSTANTS.DEFAULT_AGE,
    },
    futureProjections: getDefaultProjections(),
    summary: {
      finalAmount: 0,
      croreStatus: "Error in calculations. Please check your EPF data.",
      monthlyContribution: 0,
    },
  };
}

function parseCurrencyString(currencyStr:any) {
  try {
    if (!currencyStr) return 0;
    return Number(currencyStr.replace(/[₹,]/g, "")) || 0;
  } catch {
    return 0;
  }
}

// function formatIndianCurrency(amount) {
//   try {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       maximumFractionDigits: 0,
//     }).format(amount || 0);
//   } catch {
//     return "₹0";
//   }
// }


export {
  CONSTANTS,
  calculateEPFOProjections
}