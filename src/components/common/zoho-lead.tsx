import { post } from "./api";

export const ZohoLeadApi = async (zohodata: any) => {
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
            Total_PF_Balance: zohodata?.Total_PF_Balance
        };
        try {
            const result = await post('data/createLead', { formData: zohoReqData });
            return result
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    }


}