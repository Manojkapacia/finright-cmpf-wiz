import moment from 'moment-timezone';

export const formatISTHourSlot = (utcHourStart: any) => {
    const start = moment.utc(utcHourStart).tz('Asia/Kolkata');
    const end = start.clone().add(1, 'hour');
    return `${start.format('hh:mm A')} - ${end.format('hh:mm A')} IST`;
}


export const getOtpFromSms = async () => {
    if ('OTPCredential' in window) {
      try {
        const abortController = new AbortController();
  
        const content = await (navigator.credentials as any).get({
          otp: { transport: ['sms'] },
          signal: abortController.signal,
        });
  
        return content?.code || "";
      } catch (err) {
        console.warn("Web OTP API failed:", err);
        return "";
      }
    } else {
      console.log("Web OTP not supported");
      return "";
    }
  }
  export const formatToISO = (dateStr: string, timeStr: string) => {
    // Example: dateStr = "03 September 2025", timeStr = "04:00 PM"
    
    // Extract components
    const [day, monthName, year] = dateStr.split(" ");
    const months: { [key: string]: number } = {
      January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
      July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
    };
  
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
  
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  
    const date = new Date(Number(year), months[monthName], Number(day), hours, minutes);
  
    // Get timezone offset in "+hh:mm" format
    const tzOffset = -date.getTimezoneOffset(); // in minutes
    const sign = tzOffset >= 0 ? "+" : "-";
    const pad = (num: number) => String(Math.floor(Math.abs(num))).padStart(2, "0");
    const hoursOffset = pad(tzOffset / 60);
    const minutesOffset = pad(tzOffset % 60);
  
    const localISO = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  
    return `${localISO}${sign}${hoursOffset}:${minutesOffset}`;
  }
  
  
  
