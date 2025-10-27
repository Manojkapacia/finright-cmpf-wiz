import { useState, useEffect } from 'react';
import "../../styles/calenderBooking.css"
import { BsCalendar3, BsClock } from "react-icons/bs";
import {
  BsCheckCircle,
  BsEnvelope,
  BsTelephone,
  BsInfoCircle,
} from 'react-icons/bs';
import { BsLightbulb } from "react-icons/bs";

import { useLocation, useNavigate } from 'react-router-dom';
import "../../styles/BookingConfirmed.css"
import { post } from '../../common/api';
import { decryptData } from '../../common/encryption-decryption';
import ToastMessage from '../../common/toast-message';
import LoaderPayment from '../../user-registeration/Onboarding2.0/common/loaderPayment';

const CalendarBooking = () => {
  // State management for calendar and booking
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [calendarDays, setCalendarDays] = useState<(Date | null)[]>([]);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [view, setView] = useState<'calendar' | 'confirmation' | 'success'>('calendar');
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobile_number, setMobileNumber] = useState<string>('');
  const [message, setMessage] = useState({ type: "", content: "" });
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(true);
  const prevRoute = location.state?.prevRoute;
 const [bookingTypeId, setBookingTypeId] = useState<number>();

  useEffect(() => {
    const storedName = decryptData(localStorage.getItem("user_name"));
    const mobile_number = decryptData(localStorage.getItem("user_mobile"));

    if (storedName) setName(storedName);
    if (mobile_number) setMobileNumber(mobile_number);

    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        const res = await post("/tidy-call-booking-calendar", { mobile_number });
        console.log("rese",res);
        if (res?.success && res.data?.bookingTypeId) {
          setBookingTypeId(res.data.bookingTypeId);
        }
      } catch (error) {
        console.error("❌ Failed to fetch booking details:", error);
      }
      finally {
        setIsLoading(false);
      }
    };
    fetchBookingDetails();
  }, []);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of the month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    setCalendarDays(days);
  }, [currentDate]);
  useEffect(() => {
    const fetchSlots = async () => {
      if (!bookingTypeId) return; 
      setIsLoadingSlots(true);
      try {
        const now = new Date();
        const tenDaysLater = new Date();
        tenDaysLater.setDate(now.getDate() + 10); 

        // ✅ Format properly: YYYY-MM-DDTHH:mm:ssZ (no milliseconds)
        const formatUTC = (date: Date) =>
          date.toISOString().split('.')[0] + 'Z';

        const starts_at = formatUTC(now);
        const ends_at = formatUTC(tenDaysLater);
        const res = await post("/tidy-slot-availability", { bookingTypeId, starts_at, ends_at });
        const slotsArray = res?.data?.data || [];
        setAvailableSlots(slotsArray);
      } catch (error) {
        console.error("❌ Failed to fetch slots:", error);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [bookingTypeId]);


  const filteredSlots = selectedDate
    ? availableSlots.filter(slot => {
      const slotDate = new Date(slot.starts_at);
      return (
        slotDate.getFullYear() === selectedDate.getFullYear() &&
        slotDate.getMonth() === selectedDate.getMonth() &&
        slotDate.getDate() === selectedDate.getDate()
      );
    })
    : [];
  /**
   * Navigate to previous month
   */
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  /**
   * Navigate to next month
   */
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  /**
   * Handle day selection
   */
  const handleDayClick = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only allow selecting current or future dates
    if (day >= today) {
      setSelectedDate(day);
      setSelectedTime(null);
    }
  };

  /**
   * Handle time slot selection - opens modal
   */
  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    setView('confirmation');
  };
  /**
   * Handle booking confirmation
   */
  const handleConfirmBooking = async () => {
    if (!name) {
      setMessage({ type: "error", content: "Name is required." });
      return;
    }
    if (!email) {
      setMessage({ type: "error", content: "Email is required." });
      return;
    }

    setIsLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;


      // ✅ Convert selected date and time to UTC ISO string (starts_at)
      const dateObj = new Date(selectedDate!);
      const [time, modifier] = selectedTime!.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      dateObj.setHours(hours, minutes, 0, 0);

      const starts_at = dateObj.toISOString().split(".")[0] + "Z";

      const payload = {
        bookingTypeId,
        starts_at,
        name,
        email,
        timezone,
        mobile_number,
      };

      const res = await post("/tidy-create-booking", payload);

      if (res?.success) {
        setBookingDetails(res.data);
        setView("success");
      } else {
        setMessage({ type: "error", content: res?.message || "Booking failed." });
      }
    } catch (error) {
      console.error("❌ Booking failed:", error);
      setMessage({ type: "error", content: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const onBackToDashboard = () => {
    navigate(prevRoute || '/dashboard', { 
      state: { 
        fromBooking: true, 
        ...(location.state || {})
      } 
    });
  };
  const handleChangeSlot = () => {
    setView('calendar');
  };
  /**
   * Check if a date is today
   */
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  /**
   * Check if a date is in the past
   */
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  /**
   * Check if a date is selected
   */
  const isSelected = (date: Date): boolean => {
    return selectedDate !== null &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };
  const convertUTCToIST = (utcString: string) => {
    if (!utcString) return "";
    return new Date(utcString); // this automatically represents IST if your system timezone is IST
  };
  useEffect(() => {
    if (view === 'success') {
 
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const timer = setTimeout(() => {
        navigate(prevRoute || '/dashboard', { 
          state: { 
            fromBooking: true,  
            ...(location.state || {})
          } 
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [view, navigate]);
  if (view === 'confirmation' && selectedDate && selectedTime) {
    return (
      <>
        {message.content && (
          <ToastMessage
            message={message.content}
            type={message.type}
          />
        )}
        <div  style={{backgroundColor: '#fff'}}>
      <div className="container py-4 " style={{backgroundColor: '#fff'}}>
        <div className="calendar-booking-wrapper">
          <span style={{ fontFamily: 'Poppins', fontWeight: '600', fontStyle: 'SemiBold', fontSize: '2rem', color: '#000000', whiteSpace: 'nowrap', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>Book consultation call</span>
          <div className="calendar-layout mt-3">
            {/* Calendar Section */}
            {/* LEFT: Profile / Info */}

            <div className="desktop-info-boxes d-block d-md-none">
              <div className="info-box1">
                <span style={{ fontFamily: 'Poppins', fontWeight: '600', fontStyle: 'SemiBold', fontSize: '1.5rem', color: '#00124F', whiteSpace: 'nowrap' }}>Choose a date</span>
                <p>A 30-minute PF consultation call where the expert reviews your account assessment report, explains findings, understands your needs, and provides a personalized resolution plan of action to help you achieve your goals efficiently.</p>
              </div>
            </div>
            <div className="info-box d-none d-md-block">
              <div className="info-title">
                <BsTelephone   style={{color:'#4255CB'}}/>
                <span>How will we connect</span>
              </div>
              <p className="info-text">
                The expert will call your registered number. NRIs will be
                contacted via WhatsApp; share your WhatsApp number or email{' '}
                <a href="mailto:support@finright.in" className="info-link">
                  support@finright.in
                </a>{' '}
                for other modes.
              </p>
            </div>
            <div className="calendar-card py-4">
              <div
                className="py-4"
                style={{ borderRadius: "20px" }}
              >
                <div className="p-1 p-sm-1">
                  <h2 className=" mb-4 text-start" style={{ fontFamily: 'Poppins', fontWeight: '600', fontStyle: 'SemiBold', fontSize:'1.5rem', color: '#00124F', whiteSpace: 'nowrap' }}>
                    Confirm Details
                  </h2>


                  <div className="mb-4">
                    <label htmlFor="name" className="form-label fw-medium medium">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Enter Name"
                      className="form-control"
                      style={{ height: "44px", borderRadius: "8px" }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {/* Email Input */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-medium medium">
                      Enter Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter Email"
                      className="form-control"
                      style={{ height: "44px", borderRadius: "8px" }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Date and Time Display */}
                  <div className="pt-2 mb-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <BsCalendar3 size={18} className=" flex-shrink-0"   style={{color:'#4255CB'}}/>
                      <span className="text-black large">
                        <strong>Date:</strong> {selectedDate?.toLocaleDateString()}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <BsClock size={18} className=" flex-shrink-0" style={{color:'#4255CB'}}/>
                      <span className="text-black large">
                        <strong>Time:</strong> {selectedTime}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 d-grid gap-3">
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      className="btn  py-2 fw-medium"
                      style={{ borderRadius: "8px", fontSize: "1rem",backgroundColor: '#4255CB',color: '#ffffff',border: '1px solid #304DFF'}}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Confirming...
                        </>
                      ) : 'Confirm'}
                    </button>

                    <button
                      type="button"
                      onClick={handleChangeSlot}
                      disabled={isLoading}
                      className="btn btn-outline-primary py-2 fw-medium"
                      style={{ borderRadius: "8px", fontSize: "1rem" }}
                    >
                      Change Slot
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Time Slot Selection */}
            {selectedDate && (
              <section className="time-slots-section d-none d-md-block">
                <div className="time-slots-card">
                  <h3 className="time-slots-title">Select time:</h3>

                  <div className="time-slots-grid">
                    {filteredSlots.length > 0 ? (
                      filteredSlots.map((slot, i) => {
                        const timeStr = new Date(slot.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div key={i}>
                              <button
                                className={`time-slot-button ${selectedTime === timeStr ? "selected" : ""}`}
                                onClick={() => setSelectedTime(timeStr)}
                              >
                                {timeStr}
                              </button>
                          </div>
                        );
                      })
                    ) : (
                      <p>No slots available for this date.</p>
                    )}
                  </div>
                </div>
              </section>
            )}
            <div className="info-box d-block d-md-none">
              <div className="info-title">
                <BsTelephone style={{color:'#4255CB'}}/>
                <span>How will we connect</span>
              </div>
              <p className="info-text">
                The expert will call your registered number. NRIs will be
                contacted via WhatsApp; share your WhatsApp number or email{' '}
                <a href="mailto:support@finright.in" className="info-link">
                  support@finright.in
                </a>{' '}
                for other modes.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
      </>
    );
  }
  if (view === 'success') {
    const startTimeIST = bookingDetails ? convertUTCToIST(bookingDetails.startTime) : null;
    const formattedDate = startTimeIST?.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = startTimeIST?.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return (
      <div  style={{backgroundColor: '#fff'}}>
      <div className="container py-4" style={{backgroundColor: '#fff'}}>
        <div className="calendar-booking-wrapper mt-3">
          {/* ✅ Header Section */}
          <div className="row text-center">
            <div className="col-12 d-block d-md-none">
              <div className="check-icon-wrapper">
                <BsCheckCircle className="check-icon" />
              </div>
              <h1 className="booking-confirmed-main-title">Booking Confirmed!</h1>
              <p className="booking-confirmed-subtitle">
                Your call with our PF expert has been scheduled
              </p>
            </div>
          </div>

          {/* ✅ Main Content */}
          <div className="row" style={{display: 'flex', justifyContent: "space-around"}}>
            {/* Left Column - Booking Details */}
            <div className="col-12 col-lg-4 ">
            <div className="d-none d-md-block">
              <div className="check-icon-wrapper">
                <BsCheckCircle className="check-icon" />
              </div>
              <h1 className="booking-confirmed-main-title">Booking Confirmed!</h1>
              <p className="booking-confirmed-subtitle">
                Your call with our PF expert has been scheduled
              </p>
            </div>
              <div className="booking-card">
                <div className="detail-row">
                  <div className="detail-label">
                    <BsCalendar3 className="detail-icon" />
                    <span>Date:</span>
                  </div>
                  <div className="detail-value">{formattedDate}</div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <BsClock className="detail-icon" />
                    <span>Time:</span>
                  </div>
                  <div className="detail-value">{formattedTime} </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <BsEnvelope className="detail-icon" />
                    <span>Email</span>
                  </div>
                  <div className="detail-value">{bookingDetails?.email}</div>
                </div>

                <div className="detail-row no-border">
                  <div className="detail-label">
                    <BsTelephone className="detail-icon" />
                    <span>Contact</span>
                  </div>
                  <div className="detail-value">{bookingDetails?.registeredMobileNumber}</div>
                </div>
              </div>
            </div>

            {/* Right Column - Actions & Info */}
            <div className="col-12 col-lg-4">
              <button
                className="booking-confirmed-btn"
                onClick={onBackToDashboard}
              >
                Back to Dashboard
              </button>

              <div className="info-box">
                <div className="info-title">
                  <BsInfoCircle />
                  <span>Next Steps</span>
                </div>
                <p className="info-text">
                  Complete your profile for the best call experience. Our experts
                  analyze your information beforehand to provide personalized,
                  well-prepared guidance during consultation.
                </p>
              </div>

              <div className="info-box">
                <div className="info-title">
                  <BsTelephone />
                  <span>How will we connect</span>
                </div>
                <p className="info-text">
                  The expert will call your registered number. NRIs will be
                  contacted via WhatsApp; share your WhatsApp number or email{' '}
                  <a href="mailto:support@finright.in" className="info-link">
                    support@finright.in
                  </a>{' '}
                  for other modes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    )
  }
  return (
    <>
    {isLoading ?( <LoaderPayment/>): (
      <>
      <div style={{backgroundColor: '#fff'}}>
      <div className="container py-4" style={{ backgroundColor: '#fff' }}>
        <div className="calendar-booking-wrapper">
          <span style={{ fontFamily: 'Poppins', fontWeight: '600', fontStyle: 'SemiBold', fontSize: '2rem', color: '#000000', whiteSpace: 'nowrap', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>Book consultation call</span>
          <div className="calendar-layout mt-3">
            {/* Calendar Section */}
            {/* LEFT: Profile / Info */}

            <div className="desktop-info-boxes">
              <div className="info-box1">
                <span style={{ fontFamily: 'Poppins', fontWeight: '600', fontStyle: 'SemiBold', fontSize: '1.5rem', color: '#00124F', whiteSpace: 'nowrap' }}>Choose a date</span>
                <p>A 30-minute PF consultation call where the expert reviews your account assessment report, explains findings, understands your needs, and provides a personalized resolution plan of action to help you achieve your goals efficiently.</p>
              </div>
              <div className="info-box d-none d-md-block">
                <div className="info-title">
                  <BsLightbulb style={{color:'#4255CB'}}/>
                  <span>Quick Tips</span>
                </div>
                <div className="info-text">
                  <p>• Slots : 9.00 AM to 7.00 PM Mon - Sat</p>
                  <p>• Confirmation email after booking</p>
                  <p>• Reschedule up to 24 hours before</p>
                </div>
              </div>
            </div>
            <section className="calendar-card">
              {/* Calendar Header with Month Navigation */}
              <header className="calendar-header">
                <button
                  className="btn btn-link nav-btn"
                  onClick={handlePreviousMonth}
                  aria-label="Previous month"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>

                <h3>{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</h3>
                <button
                  className="btn btn-link nav-btn"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </header>

              {/* Day Names Header */}
              <div className="day-names">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="day-name">{day}</div>
                ))}
              </div>


              {/* Calendar Grid */}
              <div className="calendar-grid">
                {calendarDays.map((day, index) => (
                  <div key={index} className="calendar-cell">
                    {day ? (
                      <button
                        className={`day-button ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''
                          } ${isPastDate(day) ? 'disabled' : ''}`}
                        onClick={() => handleDayClick(day)}
                        disabled={isPastDate(day)}
                      // aria-label={`Select ${day.toLocaleDateString()}`}
                      >
                        {day.getDate()}
                      </button>
                    ) : (
                      <div className="empty-cell"></div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            {/* Time Slot Selection */}
            {selectedDate && (
              <section className="time-slots-section">
                <div className="time-slots-card">
                  <h3 className="time-slots-title">Choose Time</h3>
                  {isLoadingSlots ? (
                    <div className="text-center p-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="time-slots-grid">
                      {filteredSlots.length > 0 ? (
                        filteredSlots.map((slot, i) => {
                          const timeStr = new Date(slot.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          return (
                            <div key={i}>
                              {selectedTime === timeStr ? (
                                <div className="split-buttons">
                                  <button className="time-slot-button half disabled">
                                    {timeStr}
                                  </button>
                                  <button className="time-slot-button half next-btn" onClick={() => handleTimeClick(timeStr)}>
                                    Next
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className={`time-slot-button ${selectedTime === timeStr ? "selected" : ""}`}
                                  onClick={() => setSelectedTime(timeStr)}
                                >
                                  {timeStr}
                                </button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p>No slots available for this date.</p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            <div className="info-box d-block d-md-none">
              <div className="info-title">
                <BsLightbulb />
                <span>Quick Tips</span>
              </div>
              <div className="info-text">
                <p>• Slots : 9.00 AM to 7.00 PM Mon - Sat</p>
                <p>• Confirmation email after booking</p>
                <p>• Reschedule up to 24 hours before</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
    )}
    </>
  );
};

export default CalendarBooking;
