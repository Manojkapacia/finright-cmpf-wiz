// import clarity from "@microsoft/clarity";
// import MESSAGES from "../components/constant/message";

// const restrictedPaths = [
//   MESSAGES.BASE_URL, 
//   MESSAGES.PF_CHECK_UP_BASE_URL, 
//   MESSAGES.PF_CHECK_UP_PROD_URL
// ];
// const currentPath = window.location.origin;

// export const identifyUser = (userId: any, sessionId?: any) => {
//   if(!restrictedPaths.some(url => currentPath.includes(url))  && userId){
//     clarity.init("qs1p34z4yw");
//     clarity.identify(userId, sessionId);
//   }
// };

// export const setClarityTagButton = (key: any, value: any | any[]) => {
//   if(!restrictedPaths.some(url => currentPath.includes(url))  && (key && value)){
//     clarity.init("qs1p34z4yw");
//     clarity.setTag(key, value);
//   }
// }


import clarity from "@microsoft/clarity";

export const initClarity = () => {
  if (window.location.hostname === "uat.finright.in") {
    clarity.init("qs1p34z4yw");
  }
};

export const identifyUser = (userId: string) => {
  if (typeof window.clarity === "function") {
    console.log("user id",userId);
    
    window.clarity("identify", userId);
  }
};

export const setClarityTag = (key: string, value: string | string[]) => {
  if (typeof window.clarity === "function") {
    console.log("user id",key, value);
    window.clarity("set", key, value);
  }
};
