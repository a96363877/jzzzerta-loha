"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { onValue, ref } from "firebase/database"
import { database } from "../lib/firestore"

interface PaymentStatusProps {
  paymentId: string
}

export function PaymentStatus({ paymentId }: PaymentStatusProps) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${paymentId}`)

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val()
      setIsOnline(data && data.state === "online")
    })

    return () => unsubscribe()
  }, [paymentId])

  return (
    <Badge
      variant="outline"
      className={`
        ${
          isOnline
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        } transition-colors duration-300
      `}
    >
      <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></span>
      <span className="text-xs">{isOnline ? "متصل" : "غير متصل"}</span>
    </Badge>
  )
}
