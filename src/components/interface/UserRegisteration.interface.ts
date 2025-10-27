export interface UserRegistrationOtpInputProps {
    resendText: string;
    timerText: string;
  }
  
  export interface UserRegistrationTextContentProps{
    headText:string
    singleviewText:string

  }

  export interface UserRegistrationEpfMemberLogoTextProps{
      epfMemberLogoTextContent:string
  }
  export interface CurrentWorkingCompanyProps {
    currentEmploymentUanData: any;
    setIsModalOpen: (value: boolean) => void;
    onCompanySelect: (company: string) => void;
  }