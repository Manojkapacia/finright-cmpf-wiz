export const ToTitleCase = (str: any) => {
  if(!str) return;
    return str
      .toLowerCase()
      .split(" ")
      .map((word:any) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };