import CryptoJS from "crypto-js";
const SECRET_KEY = "ENCRYPTABLE_STORAGE_DATA_KEY";

// Function to encrypt data
export const encryptData = (data:any):any => {
  try {
    const ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      SECRET_KEY
    ).toString();
    return ciphertext;
  } catch (error) {
    console.error("Error encrypting data:", error);
    return null;
  }
};

// Function to decrypt data
export const decryptData = (ciphertext:any):any => {
  try {
    if(!ciphertext) return
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedStr) {
      return null;
    }

    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
};
