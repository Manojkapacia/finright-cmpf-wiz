export const calculateServiceDetails = (employmentHistory:any) => {
    if (!employmentHistory?.length) return null;

    // Get the last item in the array
    const lastEmployment = employmentHistory[employmentHistory?.length - 1];

    if(!lastEmployment || !lastEmployment?.date_of_joining) return null
    
    const joiningDate = new Date(lastEmployment?.date_of_joining);
    
    // Get the current date
    const currentDate = new Date();

    // Calculate difference in years and months
    let years = currentDate.getFullYear() - joiningDate.getFullYear();
    let months = currentDate.getMonth() - joiningDate.getMonth();

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return {
        service: `${years} years ${months} months`,
        year: `${joiningDate.getFullYear()}-${new Date().getFullYear()}`
    };
}

export const formatDateInStringMode = (dateStr:any) => {
    if(!dateStr) return;
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const [day, month, year] = dateStr?.split('-');
    return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

export const formatJoiningDate = (input: any): string => {
    if (!input || typeof input !== 'string') return 'NA';
  
    const parts = input.split(' - ').map((s: any) => s?.trim()?.toLowerCase());
    const isNA = (val: any) => !val || val === 'na' || val === 'null';
  
    if (parts.every(isNA)) return 'NA';
  
    const formatToMonthYear = (dateStr: string): string | null => {
      if (!dateStr) return null;
  
      // Try direct parsing (e.g., "10-Mar-2022", "Mar 2022", "2022-03-10")
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric',
        }); // e.g., "Mar 2022"
      }
  
      // Try manual match for formats like "10-Mar-2022"
      const regex = /^(\d{1,2})-(\w{3})-(\d{4})$/i;
      const match = dateStr.match(regex);
      if (match) {
        const [, , month, year] = match;
        return `${month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()} ${year}`;
      }
  
      // Handle "Mar 2022" format directly
      const monthYearMatch = dateStr.match(/^([a-zA-Z]{3,}) (\d{4})$/);
      if (monthYearMatch) {
        const [_, mon, yr] = monthYearMatch;
        return `${mon.charAt(0).toUpperCase() + mon.slice(1).toLowerCase()} ${yr}`;
      }
  
      return null;
    };
  
    const firstFormatted = formatToMonthYear(parts[0]);
    if (!firstFormatted) return 'NA';
  
    const secondPart = parts[1];
    if (isNA(secondPart)) return `${firstFormatted} - NA`;
  
    return `${firstFormatted} - ${secondPart.charAt(0).toUpperCase() + secondPart.slice(1)}`;
  };
  
