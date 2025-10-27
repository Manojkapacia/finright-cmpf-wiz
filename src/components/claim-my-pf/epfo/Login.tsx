import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../configs/axios';
import { LoginStatusOverlay } from '../Ovelay';

interface LocationState {
  currentUanData?: any;
  amount?: any;
}

const TIMER_KEY = "login-otp-timer-start";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state as LocationState) || {};
  const uanData = state.currentUanData;
  const selectedAmount = state.amount;

  const [statusMessage, setStatusMessage] = useState('Authenticating, please wait...');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [userId, setUserId] = useState('');

  const performLogin = useCallback(async (userId: string, clientUan: string) => {
    try {
      const response = await axios.post('claim/login', { userId, clientUan });
      return response?.data;
    } catch (err) {
      return { success: false };
    }
  }, []);

  const startAuthentication = useCallback(async () => {
    try {
      setIsLoading(true);

      const welcomeRes = await axios.post('claim/welcome');
      const fetchedUserId = welcomeRes.data?.userId;
      const clientUan = uanData?.rawData?.data?.profile?.UAN;
      // setUserId(fetchedUserId);

      if (!fetchedUserId || !clientUan) {
        throw new Error('Missing userId or UAN');
      }

      const retryMessages = [
        'Establishing secure connection...',
        'Validating your credentials...',
        'Checking EPFO records...',
        'Trying alternate secure route...',
        'Re-authenticating, please wait...',
        'Refreshing session and retrying...',
        'Almost there, one last try...',
        'Final attempt in progress...',
      ];

      let loginSuccess = false;
      let retryCount = 0;

      while (!loginSuccess && retryCount < retryMessages.length) {
        const loginResponse = await performLogin(fetchedUserId, clientUan);

        if (
          loginResponse?.message === 'Invalid Username or Password' &&
          loginResponse?.errors?.invalidCaptcha === false
        ) {
          navigate('/claim-epfo/invalid-credential', {
            state: { currentUanData: uanData },
          });
          return;
        }

        if (loginResponse?.success) {
          loginSuccess = true;
        } else {
          setStatusMessage(retryMessages[retryCount]);
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      if (loginSuccess) {
        setStatusMessage('Login successful! Redirecting...');
        setIsError(false);
        localStorage.removeItem(TIMER_KEY);
        setTimeout(() => {
          navigate('/claim-epfo/login-otp', {
            state: { userId: fetchedUserId, uanData, selectedAmount },
          });
        }, 2000);

        
      } else {
        setStatusMessage('Unable to login after multiple attempts.');
        setIsError(true);
        setTimeout(() => {
          navigate('/claim-epfo/error-page', {
            state: { userId: fetchedUserId, uanData, selectedAmount },
          });
        }, 0);
      }
    } catch (err) {
      setStatusMessage('Something went wrong. Please try again later.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, uanData, selectedAmount, performLogin]);

  useEffect(() => {
    startAuthentication();
  }, [startAuthentication]);

  return (
    <div className="container-fluid">
    <div className="row" style={{ height: "90vh" }}>
      <div
        className="col-md-4 offset-md-4 d-flex flex-column justify-content-center align-items-center"
        style={{
          height: "90vh",
          backgroundColor: "#E6ECFF",
          fontFamily: "Poppins",
          overflow: "hidden",
        }}
      >
        <LoginStatusOverlay
          statusMessage={statusMessage}
          isReady={!isLoading}
          isError={isError}
        />
      </div>
    </div>
  </div>
  
  
  
  );
};

export default Login;
