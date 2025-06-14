import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PaymentDocument } from "@/type/payment"

interface PaymentDetailsProps {
  payment: PaymentDocument
}

export function PaymentDetails({ payment }: PaymentDetailsProps) {
  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})/g, "$1 ").trim()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Payment Details
          <Badge variant={payment.online ? "default" : "secondary"}>{payment.online ? "Online" : "Offline"}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Document ID</h3>
            <p className="font-mono text-sm">{payment.id}</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Page Name</h3>
            <p>{payment.pagename}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold">Card Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Cardholder Name</h4>
              <p>{payment.cardholderName}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Card Number</h4>
              <p className="font-mono">{formatCardNumber(payment.cardNumber)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Expiry Date</h4>
              <p>{payment.expiryDate}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">CVV</h4>
              <p className="font-mono">{"*".repeat(payment.cvv.length)}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold">Billing Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Address</h4>
              <p>{payment.billingAddress}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">City</h4>
              <p>{payment.city}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Country</h4>
              <p>{payment.country}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Zip Code</h4>
              <p>{payment.zipCode}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold">Security & Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">OTP</h4>
              <p className="font-mono">{payment.otp}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">All OTPs</h4>
              <p className="font-mono">{payment.allOtps.join(", ")}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold">Timestamps</h3>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Created Date</h4>
              <p className="text-sm">{formatDate(payment.createdDate)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Last Seen</h4>
              <p className="text-sm">{payment.lastSeen.sv}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
