import { formatCurrency, parseCurrency } from "./currency-formatter";

export const getClosingBalance = (passbooks:object) => {
    if(!passbooks)     
        return {
            employeeShare: "₹ 0",
            employerShare: "₹ 0",
            pensionShare: "₹ 0",
            interestShare:  "₹ 0",
            currentYearInterestShare: "₹ 0",
            year: "--"
        }
;

    // Find the latest year dynamically and calculate totals
    let totalEmployeeShare = 0;
    let totalEmployerShare = 0;
    let totalPensionShare = 0;
    let totalEmployeeShareInterest = 0;
    let totalEmployerShareInterest = 0;
    let totalPensionShareInterest = 0;
    let totalInterestShare = 0;
    let currentYearInterestShare = 0;
    let year = "AY'"

    for (const passbook of Object.values(passbooks)) {
        // Extract years and find the latest one
        const years = Object.keys(passbook).map(Number);
        const latestYear = Math.max(...years);
        if (year === "AY'") {
            // Set year to the last two digits of the latest year
            year = year + latestYear.toString().slice(-2)
        }

        if (passbook[latestYear] && passbook[latestYear]?.closingBalance) {
            const { employeeShare, employerShare, pensionShare } = passbook[latestYear]?.closingBalance;
            totalEmployeeShare += employeeShare && parseCurrency(employeeShare);
            totalEmployerShare += employerShare && parseCurrency(employerShare);
            totalPensionShare += pensionShare && parseCurrency(pensionShare);
        }

        // get latest year interest
        if (passbook[latestYear] && passbook[latestYear]?.interestDetails) {
            const { employeeShare, employerShare, pensionShare } = passbook[latestYear]?.interestDetails;
            currentYearInterestShare += (employeeShare && parseCurrency(employeeShare)) + (employerShare && parseCurrency(employerShare)) + (pensionShare && parseCurrency(pensionShare));
        }

        // get complete interest details
        for (const year of years) {
            // Check if interestDetails exist for the current year
            if (passbook[year] && passbook[year]?.interestDetails) {
                const { employeeShare, employerShare, pensionShare } = passbook[year]?.interestDetails;
                // Accumulate the shares
                totalEmployeeShareInterest += employeeShare && parseCurrency(employeeShare);
                totalEmployerShareInterest += employerShare && parseCurrency(employerShare);
                totalPensionShareInterest += pensionShare && parseCurrency(pensionShare);
            }
        }
        totalInterestShare = totalEmployeeShareInterest + totalEmployerShareInterest + totalPensionShareInterest
    }

    return {
        employeeShare: totalEmployeeShare ? formatCurrency(totalEmployeeShare - totalEmployeeShareInterest) : "₹ 0",
        employerShare: totalEmployerShare ? formatCurrency(totalEmployerShare - totalEmployerShareInterest) : "₹ 0",
        pensionShare: totalPensionShare ? formatCurrency(totalPensionShare - totalPensionShareInterest) : "₹ 0",
        interestShare: totalInterestShare ? formatCurrency(totalInterestShare) : "₹ 0",
        currentYearInterestShare: formatCurrency(currentYearInterestShare),
        year
    }
}

export const getLastContribution = (data:any) => {
    if (!data) return 'N/A'
    let contribution:any = 'N/A'

    const currentEmployer = data?.serviceHistory?.history?.find(
        (entry:any) => entry.period.toLowerCase().includes("present")
    );

    if (!currentEmployer) return contribution;

    const memberId = currentEmployer?.details?.["Member Id"];
    const passbook = data?.passbooks[memberId];

    if (!passbook) return 'N/A';

    let mostRecentTransaction:any = null;

    // Iterate through years to find the most recent transaction
    Object.values(passbook).forEach((yearData:any) => {
        yearData?.transactions?.forEach((transaction:any) => {
            if (
                !mostRecentTransaction ||
                new Date(transaction?.transactionDate?.split("-").reverse().join("-")) >
                new Date(
                    mostRecentTransaction?.transactionDate?.split("-").reverse().join("-")
                )
            ) {
                mostRecentTransaction = transaction;
            }
        });
    });

    if (mostRecentTransaction) {
        contribution = formatCurrency((mostRecentTransaction.employeeShare && parseCurrency(mostRecentTransaction.employeeShare)) + parseCurrency(mostRecentTransaction.employerShare) + parseCurrency(mostRecentTransaction.pensionShare))
    }

    return contribution;
}

export const getShareByPassbook = (passbook: any) => {
    let totals = {
        employeeShare: 0,
        employerShare: 0,
        pensionShare: 0,
        interestShare: 0,
        totalAmount: 0,
        totalAmountWithInterest: 0
    };
    
    for (const year in passbook) {
        const yearData = passbook[year];

        // Add transactions
        if (yearData?.transactions) {
            yearData?.transactions?.forEach((transaction: any) => {
                let multiplier = transaction.transactionType === "+" ? 1 : -1;

                totals.employeeShare = Math.max(0, totals.employeeShare + multiplier * parseInt(transaction?.employeeShare?.replace(/\D/g, ""), 10));
                totals.employerShare = Math.max(0, totals.employerShare + multiplier * parseInt(transaction?.employerShare?.replace(/\D/g, ""), 10));
                totals.pensionShare = Math.max(0, totals.pensionShare + multiplier * parseInt(transaction?.pensionShare?.replace(/\D/g, ""), 10));
            });
        }

        // Add interest details
        if (yearData?.interestDetails) {
            totals.interestShare += parseInt(yearData?.interestDetails?.employeeShare.replace(/\D/g, ""), 10) || 0;
            totals.interestShare += parseInt(yearData?.interestDetails?.employerShare.replace(/\D/g, ""), 10) || 0;
        }
    }

    // Ensure total amounts are non-negative
    totals.totalAmount = Math.max(0, totals.employeeShare + totals.employerShare);
    totals.totalAmountWithInterest = Math.max(0, totals.totalAmount + totals.interestShare);
    return totals;
};

export const calculatePassbookClosingBalance = (passbook: any) => {
    if (!passbook || typeof passbook !== 'object') {
        return {
            employeeShare: 0,
            employerShare: 0,
            pensionShare: 0,
            totalAmount: 0,
        };
    }

    let totals = {
        employeeShare: 0,
        employerShare: 0,
        pensionShare: 0,
        totalAmount: 0,
    };

    const years = Object.keys(passbook)
        .filter(year => /^\d{4}$/.test(year))
        .sort();
    const latestYear = years[years.length - 1];
    const closingBalance = passbook[latestYear]?.closingBalance;

    if (closingBalance) {
        totals.employeeShare = parseInt(closingBalance?.employeeShare?.replace(/\D/g, ""), 10) || 0;
        totals.employerShare = parseInt(closingBalance?.employerShare?.replace(/\D/g, ""), 10) || 0;
        totals.pensionShare = parseInt(closingBalance?.pensionShare?.replace(/\D/g, ""), 10) || 0;
    }

    totals.totalAmount = totals.employeeShare + totals.employerShare;
    return totals;
};


export const getTotalShare = (passbooks:any) => {
    if(!passbooks) 
        return {
            totalEmployeeShare: 0,
            totalEmployerShare: 0,
            totalPensionShare: 0,
            totalBalance: "₹ 0"
        };

    let grandTotals:any = {
        totalEmployeeShare: 0,
        totalEmployerShare: 0,
        totalPensionShare: 0,
        totalBalance: "₹ 0"
    };

    for (const passbook of Object.values(passbooks) as any) {
        // Extract years and find the latest one
        const years = Object.keys(passbook as Record<string, any>).map(Number);
        const latestYear = Math.max(...years);
        
        if (passbook[latestYear] && passbook[latestYear]?.closingBalance) {
            const { employeeShare, employerShare, pensionShare } = passbook[latestYear]?.closingBalance;
            grandTotals.totalEmployeeShare += employeeShare && parseCurrency(employeeShare);
            grandTotals.totalEmployerShare += employerShare && parseCurrency(employerShare);
            grandTotals.totalPensionShare += pensionShare && parseCurrency(pensionShare);
        }
    }
    
    grandTotals.totalEmployeeShare = grandTotals.totalEmployeeShare;
    grandTotals.totalEmployerShare = grandTotals.totalEmployerShare;
    grandTotals.totalPensionShare = grandTotals.totalPensionShare;
    grandTotals.totalBalance = formatCurrency(grandTotals.totalEmployeeShare + grandTotals.totalEmployerShare)
    return grandTotals;
}

// Helper function to convert UPPER_CASE_WITH_UNDERSCORES to Camel Case
export const toCamelCase = (str: string) => {
    return str
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
