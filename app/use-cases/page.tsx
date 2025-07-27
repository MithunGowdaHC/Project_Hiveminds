"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  ShoppingBag,
  Package,
  Zap,
  Truck,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

export default function UseCasesPage() {
  const useCases = [
    {
      title: "E-commerce Campaign Analytics",
      description: "Consolidate and analyze campaign performance across multiple platforms",
      icon: BarChart3,
      features: [
        "Multi-platform data aggregation",
        "Automated report generation",
        "Performance trend analysis",
        "ROI optimization insights",
      ],
      platforms: ["Amazon", "Flipkart", "Zepto", "Blinkit"],
    },
    {
      title: "Marketing Performance Tracking",
      description: "Track and optimize your marketing spend across all channels",
      icon: TrendingUp,
      features: [
        "Real-time performance monitoring",
        "Budget allocation optimization",
        "Campaign effectiveness scoring",
        "Automated alerts and notifications",
      ],
      platforms: ["Amazon", "Flipkart"],
    },
    {
      title: "Time-Saving Automation",
      description: "Eliminate manual reporting and focus on strategy",
      icon: Clock,
      features: [
        "One-click report generation",
        "Automated data processing",
        "Scheduled report delivery",
        "Custom template creation",
      ],
      platforms: ["Amazon"],
    },
    {
      title: "Team Collaboration",
      description: "Share insights and collaborate on campaign optimization",
      icon: Users,
      features: [
        "Shared dashboards",
        "Team performance metrics",
        "Collaborative annotations",
        "Role-based access control",
      ],
      platforms: ["Coming Soon"],
    },
  ]

  const industries = [
    {
      name: "E-commerce Brands",
      description: "Optimize product campaigns across marketplaces",
      icon: ShoppingBag,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      name: "Digital Agencies",
      description: "Manage multiple client campaigns efficiently",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      name: "Quick Commerce",
      description: "Track rapid delivery platform performance",
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
    {
      name: "Logistics Companies",
      description: "Analyze delivery and fulfillment metrics",
      icon: Truck,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/50",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Powerful Use Cases for
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Every Business
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover how Excelerate transforms campaign analytics across industries and use cases
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {useCases.map((useCase, index) => (
            <Card key={index} className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
                    <useCase.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    <CardDescription className="text-base mt-1">{useCase.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {useCase.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Supported Platforms:</h4>
                    <div className="flex flex-wrap gap-2">
                      {useCase.platforms.map((platform, platformIndex) => (
                        <span
                          key={platformIndex}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            platform === "Coming Soon"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          }`}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Industries Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Built for Every Industry</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From e-commerce brands to digital agencies, Excelerate adapts to your industry's unique needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry, index) => (
              <Card
                key={index}
                className="border border-gray-200 dark:border-gray-800 text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${industry.bgColor} mb-4`}
                  >
                    <industry.icon className={`h-8 w-8 ${industry.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{industry.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{industry.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Ready to Transform Your Campaign Analytics?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using Excelerate to optimize their campaign performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 bg-transparent">
                Schedule Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
