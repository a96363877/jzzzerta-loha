"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface PaymentSearchProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function PaymentSearch({ searchTerm, onSearchChange }: PaymentSearchProps) {
  return (
    <div className="mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="بحث في المدفوعات..."
          className="pl-10 pr-4 bg-background border-border focus:border-primary transition-colors"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}
