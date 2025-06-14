"use client"

import { User, Clock, MapPin, Trash2, CreditCard, PinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { PaymentStatus } from "@/components/payment-status"
import { PaymentDocument } from "@/type/payment"

interface PaymentTableProps {
  payments: PaymentDocument[]
  onPaymentClick: (payment: PaymentDocument) => void
  onDelete: (id: string) => void
  searchTerm: string
}

export function PaymentTable({ payments, onPaymentClick, onDelete, searchTerm }: PaymentTableProps) {
  if (payments.length === 0) {
    return (
      <Card className="bg-card shadow-sm">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-muted/50 p-4 rounded-full">
                <CreditCard className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-lg font-medium">لا توجد مدفوعات</p>
                <p className="text-sm">
                  {searchTerm ? "لا توجد مدفوعات متطابقة مع البحث" : "لم يتم العثور على أي مدفوعات"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card shadow-sm overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          المدفوعات
          {searchTerm && (
            <Badge variant="outline" className="mr-2">
              نتائج البحث: {payments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-right font-medium text-muted-foreground">الدولة</th>
              <th className="px-6 py-4 text-right font-medium text-muted-foreground">حامل البطاقة</th>
              <th className="px-6 py-4 text-right font-medium text-muted-foreground">رقم البطاقة</th>
              <th className="px-6 py-4 text-right font-medium text-muted-foreground">الصفحة</th>
              <th className="px-6 py-4 text-right font-medium text-muted-foreground">OTP</th>
              <th className="px-6 py-4 text-right font-medium text-muted-foreground">الوقت</th>
              <th className="px-6 py-4 text-center font-medium text-muted-foreground">الحالة</th>
              <th className="px-6 py-4 text-center font-medium text-muted-foreground">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onPaymentClick(payment)}
              >
                 <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{payment.country  || "غير محدد"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{payment.cardholderName || "غير محدد"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                {payment.cardNumber&&  
                 <Badge
                 dir="ltr"
                    variant="default"
                    className="bg-green-700 dark:bg-blue-950/30 text-white dark:text-blue-300"
                  >
                    {payment.cardNumber}
                  </Badge>
                  }
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{payment?.pagename}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                  >
                    {payment.otp}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(new Date(payment.createdDate), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <PaymentStatus paymentId={payment.id} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(payment.id)
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 p-4">
        {payments.map((payment) => (
          <Card
            key={payment.id}
            className="overflow-hidden bg-background border-border cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onPaymentClick(payment)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{payment.cardholderName || "غير محدد"}</span>
                </div>
                <PaymentStatus paymentId={payment.id} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">رقم البطاقة:</span>
                  <span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded" dir="ltr">
                    {payment.cardNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">الموقع:</span>
                  <span className="text-sm">
                    {payment.country}/{payment.city}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">OTP:</span>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-950/30">
                    {payment.otp}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(payment.createdDate), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(payment.id)
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Card>
  )
}
