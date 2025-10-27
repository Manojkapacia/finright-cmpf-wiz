import { post } from "./api";
import { decryptData, encryptData } from "./encryption-decryption";

export const ZohoLeadApi = async (zohodata: any) => {
    const rawData = decryptData(localStorage.getItem("lead_data"));
    const rawExistUser = decryptData(localStorage.getItem("existzohoUserdata"));

    let updateKey: string | null = null;

    if (rawData) {
        updateKey = "lead_data";
    } else if (rawExistUser) {
        updateKey = "existzohoUserdata";
    }

    // Store updated value under the same key
    if (updateKey && zohodata) {
        localStorage.setItem(updateKey, encryptData(JSON.stringify(zohodata)));
    }

    if (zohodata) {
        const zohoReqData = {
            Last_Name: zohodata?.Last_Name,
            Mobile: zohodata?.Mobile,
            Email: zohodata?.Email ? zohodata?.Email : "",
            Wants_To: zohodata?.Wants_To ,
            Lead_Status: zohodata?.Lead_Status,
            Lead_Source: zohodata?.Lead_Source,
            Campaign_Id: zohodata?.Campaign_Id,
            CheckMyPF_Status: zohodata?.CheckMyPF_Status,
            CheckMyPF_Intent: zohodata?.CheckMyPF_Intent,
            Total_PF_Balance: zohodata?.Total_PF_Balance,
            Call_Schedule: zohodata?.Call_Schedule
        };
        try {
            const result = await post('data/createLead', { formData: zohoReqData });
            return result
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    }


}