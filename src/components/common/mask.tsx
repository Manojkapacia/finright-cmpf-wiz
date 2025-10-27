
export const mastLastFourDigits = (number:any, type: any) => {
    if (number) {
        const lastFourDigits = number.slice(-4);
        return type === 'aadhar' ? `XXXXXXXX${lastFourDigits}` : `XXXXXX${lastFourDigits}`;
    }
};