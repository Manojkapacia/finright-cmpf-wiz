export const ExtractMobile = (message:any) => {
    const regex = /\bX{6}\d{4}\b/;
    const match = message.match(regex);
    if (match) {
        return match[0]; // Output: XXXXXX0123
    } else {
        return ''
    }
};
