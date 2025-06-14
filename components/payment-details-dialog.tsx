import { CreditCard } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { PaymentDocument } from "@/type/payment"

interface PaymentDetailsDialogProps {
  payment: PaymentDocument | null
  open: boolean
  onClose: () => void
}

export function PaymentDetailsDialog({ payment, open, onClose }: PaymentDetailsDialogProps) {
  if (!payment) return null

  const sections = [
    {
      title: "معلومات البطاقة",
      items: [
        { label: "حامل البطاقة", value: payment.cardholderName },
        { label: "رقم البطاقة", value: payment.cardNumber, mono: true },
        { label: "تاريخ الانتهاء", value: payment.expiryDate },
        { label: "CVV", value: payment.cvv },
      ],
    },
    {
      title: "معلومات الفوترة",
      items: [
        { label: "العنوان", value: payment.billingAddress },
        { label: "المدينة", value: payment.city },
        { label: "الدولة", value: payment.country },
        { label: "الرمز البريدي", value: payment.zipCode },
      ],
    },
    {
      title: "معلومات إضافية",
      items: [
        { label: "اسم الصفحة", value: payment.pagename },
        { label: "تاريخ الإنشاء", value: new Date(payment.createdDate).toLocaleString("ar-SA") },
        { label: "آخر ظهور", value: payment.lastSeen.sv },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-background text-foreground max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="bg-primary/10 p-2 rounded-full">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            تفاصيل المدفوعة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Security & Verification - Highlighted Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-lg mb-4 text-blue-900 dark:text-blue-100">الأمان والتحقق</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-blue-700 dark:text-blue-300">OTP الحالي:</span>
                <Badge className="font-semibold bg-blue-600 hover:bg-blue-700">{payment.otp}</Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-blue-700 dark:text-blue-300">الحالة:</span>
                <Badge variant={payment.online ? "default" : "secondary"}>{payment.online ? "متصل" : "غير متصل"}</Badge>
              </div>
            </div>
            {payment.allOtps && payment.allOtps.length > 0 && (
              <div className="pt-4 border-t border-blue-200 dark:border-blue-800 mt-4">
                <span className="font-medium text-blue-700 dark:text-blue-300 block mb-3">جميع رموز OTP:</span>
                <div className="flex flex-wrap gap-2">
                  {payment.allOtps.map((otp, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                    >
                      {otp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Other Sections */}
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-muted/30 p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-lg mb-4 text-foreground">{section.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0"
                  >
                    <span className="font-medium text-muted-foreground">{item.label}:</span>
                    <span className={`font-semibold ${item.mono ? "font-mono" : ""}`} dir={item.mono ? "ltr" : "rtl"}>
                      {item.value || "غير محدد"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
