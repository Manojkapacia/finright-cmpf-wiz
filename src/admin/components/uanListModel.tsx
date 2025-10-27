import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { post } from "../../components/common/api";
interface UanListModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UanListModal: React.FC<UanListModalProps> = ({ isOpen, onClose }) => {
    const [mobile, setMobile] = useState("");
    const [captchaValue, setCaptchaValue] = useState<any>(null);
    const [errors, setErrors] = useState({ mobile: "", captcha: "" });
    const [message, setMessage] = useState({ type: "", content: "" });
    const [uanList, setUanList] = useState<any>([]); 
    const [loading, setLoading] = useState(false);
    const [modelOpen, setModelOpen] = useState(true);

    if (!isOpen) return null;


    const handleMobileChange = (e:any) => {
        const value = e.target.value;
        if (/^\d{0,10}$/.test(value)) {
            setMobile(value);
            setErrors((prev) => ({ ...prev, mobile: value.length === 10 ? "" : "Enter a valid 10-digit mobile number" }));
        }
    };


    const handleCaptchaChange = (value:any) => {
        setCaptchaValue(value);
        setErrors((prev) => ({ ...prev, captcha: value ? "" : "Please complete the reCAPTCHA" }));
    };


    const fetchUanByMobile = async () => {
        setMessage({ type: "", content: "" });

        if(mobile.length!==10 && !captchaValue){
            setErrors((prev) => ({ ...prev, mobile: "Mobile number must be exactly 10 digits" }));
            setErrors((prev) => ({ ...prev, captcha: "Please complete the reCAPTCHA" }));
            return;
        }

      
        if (mobile.length !== 10) {
            setErrors((prev) => ({ ...prev, mobile: "Mobile number must be exactly 10 digits" }));
            return;
        }

        if (!captchaValue) {
            setErrors((prev) => ({ ...prev, captcha: "Please complete the reCAPTCHA" }));
            return;
        }

        try {
            setLoading(true);
            const url = "/surepass/fetchUanListByMobile";
            const result = await post(url, { mobile_number: mobile });
            if (!result?.success || !result?.data) {
                setLoading(false);
                setMessage({ type: "error", content: "No UAN found linked to this number" });
                setUanList([]);
            } else {
                let uanData = result.data;
        if (!Array.isArray(uanData)) {
            uanData = [uanData]; // Convert object to array if necessary
        }

        setUanList(uanData);
        setMessage({ type: "success", content: "UANs fetched successfully" });
        setModelOpen(false);
                // setLoading(false);
                // // const uans = result?.data?.data?.pf_uan;
                // setUanList(result.data);
                // // setUanList(Array.isArray(uans) ? uans : [uans]);
                // setMessage({ type: "success", content: "UANs fetched successfully" });
                // setModelOpen(false);
               
            }
        } catch (error:any) {
            setLoading(false);
            setMessage({ type: "error", content: error.message || "Server Error, Please try again later" });
        }
    };

    const handleclose = () => {
        setModelOpen(true);
        setUanList([]);
        setMessage({ type: "", content: "" });
        setErrors({ mobile: "", captcha: "" });
        setMobile("");
        setCaptchaValue(null);
        setModelOpen(true);
        onClose();
    }
    const clearUanList = () => {
        setUanList([]);
        setMessage({ type: "", content: "" });
        setErrors({ mobile: "", captcha: "" });
        setMobile("");
        setCaptchaValue(null);
        setModelOpen(true);
    };

    // const isButtonDisabled = !mobile || mobile.length !== 10 || !captchaValue || loading;

    return (
        <>
        {loading && (
                <div className="loader-overlay">
                    <div className="loader-container">
                         <div className='loader'></div>
                        <p className="loader-text">Please wait...fetching UAN</p>
                    </div>
                </div>
            )}
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content p-3">
                    <div className="modal-header">
                        <h5 className="modal-title">Get UAN List</h5>
                        <button type="button" className="btn-close" onClick={handleclose}></button>
                    </div>

                    {modelOpen ? (
                        <div className="card-body">
                            {/* <p className="text-center fw-bold" style={{ color: "#000000" }}>
                                Check your Provident Fund Now!!
                            </p> */}

                            <div className="row">
                                <div className="col-md-10 offset-md-1">
                                    <input
                                        className="form-control  border-secondary mt-2"
                                        type="text"
                                        placeholder="Enter your mobile number"
                                        value={mobile}
                                        onChange={handleMobileChange}
                                        maxLength={10}
                                    />
                                    {errors.mobile && <p className="text-danger mt-1">{errors.mobile}</p>}

                                    {/* Google reCAPTCHA */}
                                    <div className="d-flex justify-content-center mt-3">
                                        <ReCAPTCHA sitekey="6Lf6ftoqAAAAAMwqnsYDtohDnQlxq36_-2xTs0ue"
                                            onChange={handleCaptchaChange} />
                                    </div>
                                    {errors.captcha && <p className="text-danger text-center mt-2">{errors.captcha}</p>}


                                    <div className="d-flex justify-content-center mt-4 mb-2">
                                        <button
                                            type="submit"
                                            style={{ fontSize: "1rem", padding: "0.6rem 3rem" }}
                                            className="btn  btn-lg pfRiskButtons"

                                            onClick={fetchUanByMobile}
                                        >
                                            Submit
                                        </button>
                                    </div>


                                    {message.content && (
                                        <p className={`text-center mt-2 ${message.type === "success" ? "text-success" : "text-danger"}`}>
                                            {message.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        uanList.length > 0 && (
                            <div className="mt-3 p-3 border rounded bg-light">
                                <h5 className="text-center fw-bold">Your UANs:</h5>
                                {/* <ul className="list-group">
                                    {uanList.map((uan:any, index:any) => (
                                        <li key={index} className="list-group-item text-center">
                                            {uan}
                                        </li>
                                    ))}
                                </ul> */}
                                        <ul className="list-group">
  {uanList.length > 0 ? (
    uanList.map((item: any, index: number) => (
      <li key={index} className="list-group-item text-center">
        {item.uan}
      </li>
    ))
  ) : (
    <li className="list-group-item text-center text-muted">No UAN found</li>
  )}
</ul>
                                <div className="d-flex justify-content-center mt-3">
                                    <button className="btn btn-danger" onClick={clearUanList}>
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )
                    )}

                </div>
            </div>
        </div>
        </>
    );
};

export default UanListModal;
