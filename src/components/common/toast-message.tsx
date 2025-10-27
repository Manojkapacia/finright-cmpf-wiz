import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastMessage = ({ message = '', type = 'success'}) => {
    useEffect(() => {
        if (message) {
            switch (type) {
                case 'success':
                    toast.success(message);
                    break;
                case 'error':
                    toast.error(message);
                    break;
                case 'info':
                    toast.info(message);
                    break;
                case 'warning':
                    toast.warning(message);
                    break;
                default:
                    toast(message);
                    break;
            }
        }
        // Only re-run when `message` or `type` changes
    }, [message, type]);

    return (
        <ToastContainer
            position='top-center'
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false} 
            draggable
            pauseOnHover={false}   
        />
    );
};

export default ToastMessage;
