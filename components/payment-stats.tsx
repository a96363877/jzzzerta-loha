import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, CheckCircle, Clock } from "lucide-react"
import type { PaymentStats } from "@/type/payment"

interface PaymentStatsProps {
  stats: PaymentStats
}

export function PaymentStatsCards({ stats }: PaymentStatsProps) {
  const statCards = [
    {
      title: "إجمالي المدفوعات",
      value: stats.total,
      icon: CreditCard,
      color: "blue",
    },
    {
      title: "المستخدمين المتصلين",
      value: stats.connected,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "المدفوعات اليوم",
      value: stats.today,
      icon: Clock,
      color: "purple",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="bg-card shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-l-primary"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center justify-between">
              {stat.title}
              <div className={`rounded-full p-2 bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                <stat.icon className={`h-4 w-4 text-${stat.color}-600 dark:text-${stat.color}-300`} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
