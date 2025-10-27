declare module "@cashfreepayments/cashfree-js" {
    export interface CashfreeStyle {
      backgroundColor?: string;
      color?: string;
      fontFamily?: string;
      button?: {
        backgroundColor?: string;
        color?: string;
        border?: string;
        padding?: string;
        borderRadius?: string;
        fontWeight?: string | number;
      };
    }
  
    export interface LoadOptions {
      mode: "sandbox" | "production";
      showLoader?: boolean;
      style?: CashfreeStyle;
    }
  
    export interface CheckoutOptions {
      paymentSessionId: string;
      redirectTarget?: "_self" | "_blank";
      onSuccess?: (data?: any) => void;
      onFailure?: (data?: any) => void;
      onClose?: () => void;
    }
  
    export interface CashfreeInstance {
      checkout: (options: CheckoutOptions) => void;
    }
  
    export function load(options: LoadOptions): Promise<CashfreeInstance>;
  }
  