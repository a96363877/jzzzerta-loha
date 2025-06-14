"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Menu, Trash2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firestore"
import { toast } from "@/hooks/use-toast"

interface DashboardHeaderProps {
  onClearAll: () => void
  paymentsCount: number
}

export function DashboardHeader({ onClearAll, paymentsCount }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

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

  return (
    <>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[280px]" dir="rtl">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>لوحة المدفوعات</span>
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
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

      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">القائمة</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">لوحة المدفوعات</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">إدارة المدفوعات والمعاملات</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              onClick={onClearAll}
              disabled={paymentsCount === 0}
              className="hidden sm:flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              مسح الكل ({paymentsCount})
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="صورة المستخدم" />
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
    </>
  )
}
