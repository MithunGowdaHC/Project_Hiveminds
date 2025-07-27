"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShoppingBag,
  Package,
  Zap,
  Truck,
  ArrowRight,
  Activity,
  Merge,
} from "lucide-react"
import { useAuthContext } from "@/hooks/useAuth"

export default function DashboardPage() {
  const { user, isSignedIn, isLoading } = useAuthContext()
  const router = useRouter()

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push("/login")
    }
  }, [isSignedIn, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render if not signed in (will redirect)
  if (!isSignedIn || !user) {
    return null
  }

  const stats = [
    {
      title: "Total Campaigns",
      value: "24",
      change: "+12%",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Active Platforms",
      value: "3",
      change: "+1",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/50",
    },
    {
      title: "Reports Generated",
      value: "156",
      change: "+23%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
    {
      title: "Time Saved",
      value: "48h",
      change: "+8h",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
    },
  ]

  const platforms = [
    {
      name: "Amazon",
      icon: ShoppingBag,
      status: "Active",
      campaigns: 18,
      lastUsed: "2 hours ago",
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      name: "Flipkart",
      icon: Package,
      status: "Coming Soon",
      campaigns: 0,
      lastUsed: "Never",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      name: "Zepto",
      icon: Zap,
      status: "Coming Soon",
      campaigns: 0,
      lastUsed: "Never",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
    {
      name: "Blinkit",
      icon: Truck,
      status: "Coming Soon",
      campaigns: 0,
      lastUsed: "Never",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/50",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.imageUrl || "/placeholder.svg"} alt={user.email} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user.firstName?.[0] || user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back, {user.firstName || user.email.split("@")[0]}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your campaigns today.</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            <BarChart3 className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">{stat.change} from last month</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump into your most common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-between h-12 bg-transparent"
                onClick={() => router.push("/#platforms")}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-amber-600" />
                  Process Amazon Campaigns
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-12 bg-transparent" disabled>
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-600" />
                  Analyze Flipkart Data
                </div>
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
                  Soon
                </span>
              </Button>
              <Button variant="outline" className="w-full justify-between h-12 bg-transparent" disabled>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Generate Reports
                </div>
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
                  Soon
                </span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between h-12 bg-transparent"
                onClick={() => router.push("/#excel-collation")}
              >
                <div className="flex items-center gap-3">
                  <Merge className="h-5 w-5 text-purple-600" />
                  Excel File Collation
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest campaign processing activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Amazon SP campaign processed</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Excel report exported</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Category mapping updated</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platforms Overview */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Manage your connected e-commerce platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platforms.map((platform, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                      <platform.icon className={`h-5 w-5 ${platform.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{platform.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          platform.status === "Active"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {platform.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Campaigns: {platform.campaigns}</p>
                    <p>Last used: {platform.lastUsed}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
