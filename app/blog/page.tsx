"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight, TrendingUp, BarChart3, Zap, Target, Users, BookOpen } from "lucide-react"

export default function BlogPage() {
  const featuredPost = {
    title: "The Complete Guide to Amazon Campaign Optimization in 2024",
    excerpt:
      "Learn the latest strategies and best practices for maximizing your Amazon advertising ROI with data-driven insights and automation.",
    author: "Sarah Chen",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "Amazon Advertising",
    image: "/placeholder.svg?height=400&width=600",
    slug: "amazon-campaign-optimization-guide-2024",
  }

  const blogPosts = [
    {
      title: "5 Common Mistakes in Multi-Platform Campaign Management",
      excerpt: "Avoid these pitfalls when managing campaigns across Amazon, Flipkart, and other e-commerce platforms.",
      author: "Mike Rodriguez",
      date: "March 12, 2024",
      readTime: "5 min read",
      category: "Best Practices",
      icon: Target,
      slug: "multi-platform-campaign-mistakes",
    },
    {
      title: "How to Automate Your Campaign Reporting Workflow",
      excerpt: "Step-by-step guide to setting up automated reporting that saves hours of manual work every week.",
      author: "Emily Johnson",
      date: "March 10, 2024",
      readTime: "6 min read",
      category: "Automation",
      icon: Zap,
      slug: "automate-campaign-reporting",
    },
    {
      title: "Understanding Campaign Attribution in E-commerce",
      excerpt: "Deep dive into attribution models and how they impact your campaign performance analysis.",
      author: "David Park",
      date: "March 8, 2024",
      readTime: "7 min read",
      category: "Analytics",
      icon: BarChart3,
      slug: "campaign-attribution-ecommerce",
    },
    {
      title: "Building High-Performance Marketing Teams",
      excerpt: "Strategies for scaling your marketing operations and building teams that deliver results.",
      author: "Lisa Wang",
      date: "March 5, 2024",
      readTime: "4 min read",
      category: "Team Management",
      icon: Users,
      slug: "building-marketing-teams",
    },
    {
      title: "The Future of E-commerce Advertising",
      excerpt: "Trends and predictions for the next generation of e-commerce advertising platforms and strategies.",
      author: "Alex Thompson",
      date: "March 3, 2024",
      readTime: "9 min read",
      category: "Industry Trends",
      icon: TrendingUp,
      slug: "future-ecommerce-advertising",
    },
    {
      title: "Data-Driven Decision Making for Campaign Managers",
      excerpt: "How to use analytics and reporting to make better campaign optimization decisions.",
      author: "Rachel Green",
      date: "March 1, 2024",
      readTime: "6 min read",
      category: "Data Science",
      icon: BarChart3,
      slug: "data-driven-campaign-decisions",
    },
  ]

  const categories = [
    "All Posts",
    "Amazon Advertising",
    "Best Practices",
    "Automation",
    "Analytics",
    "Team Management",
    "Industry Trends",
    "Data Science",
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            Excelerate Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Insights & Best Practices
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              for Campaign Success
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Stay ahead with the latest strategies, tips, and insights from our team of campaign optimization experts
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              className={index === 0 ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        <Card className="mb-16 border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <div className="text-center p-8">
                <BarChart3 className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Featured Article</p>
              </div>
            </div>
            <div className="p-8 lg:p-12">
              <Badge className="mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {featuredPost.category}
              </Badge>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {featuredPost.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">{featuredPost.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>By {featuredPost.author}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {featuredPost.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {featuredPost.readTime}
                </div>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Read Full Article
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post, index) => (
            <Card
              key={index}
              className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
                    <post.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-base">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>By {post.author}</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  >
                    Read More
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <Card className="border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Stay Updated with Latest Insights
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Get weekly tips, strategies, and industry insights delivered straight to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
