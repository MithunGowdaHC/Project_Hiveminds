"use client"

import React from "react"

import type { ReactElement } from "react"

import { useState, useCallback } from "react"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  BarChart3,
  Moon,
  Sun,
  Zap,
  ShoppingBag,
  Package,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTheme } from "next-themes"
import * as XLSX from "xlsx"
import Papa from "papaparse"

interface FileUpload {
  file: File | null
  status: "empty" | "uploaded" | "error"
  error?: string
}

interface ProcessedData {
  date: string
  campaignName: string
  portfolioName: string
  impressions: number
  clicks: number
  spend: number
  sales: number
  orders: number
  category?: string
}

interface SummaryStats {
  totalRows: number
  totalImpressions: number
  totalClicks: number
  totalSpend: number
  totalSales: number
  totalOrders: number
  dateRange: { start: string; end: string }
  uniqueCampaigns: number
  uniquePortfolios: number
  categoriesFound: number
}

const REQUIRED_COLUMNS = {
  sp: [
    "Date",
    "Campaign Name",
    "Portfolio name",
    "Impressions",
    "Clicks",
    "Spend",
    "14 Day Total Sales (₹)",
    "14 Day Total Orders (#)",
  ],
  sb: [
    "Date",
    "Campaign Name",
    "Portfolio name",
    "Impressions",
    "Clicks",
    "Spend",
    "14 Day Total Sales (₹)",
    "14 Day Total Orders (#)",
  ],
  sd: [
    "Date",
    "Campaign Name",
    "Portfolio name",
    "Impressions",
    "Clicks",
    "Spend",
    "14 Day Total Sales (₹)",
    "14 Day Total Orders (#)",
  ],
}

const PLATFORMS = {
  amazon: {
    name: "Amazon",
    icon: ShoppingBag,
    color: "amber",
    description: "Process Sponsored Products, Sponsored Brands, and Sponsored Display campaigns",
    status: "active",
  },
  flipkart: {
    name: "Flipkart",
    icon: Package,
    color: "blue",
    description: "Advanced campaign analytics and performance tracking",
    status: "coming-soon",
  },
  zepto: {
    name: "Zepto",
    icon: Zap,
    color: "violet",
    description: "Quick commerce campaign optimization and insights",
    status: "coming-soon",
  },
  blinkit: {
    name: "Blinkit",
    icon: Truck,
    color: "emerald",
    description: "Instant delivery campaign performance analysis",
    status: "coming-soon",
  },
}

export default function MultiPlatformCampaignProcessor(): ReactElement {
  const { theme, setTheme } = useTheme()
  const [files, setFiles] = useState<{
    sp: FileUpload
    sb: FileUpload
    sd: FileUpload
    mapping: FileUpload
  }>({
    sp: { file: null, status: "empty" },
    sb: { file: null, status: "empty" },
    sd: { file: null, status: "empty" },
    mapping: { file: null, status: "empty" },
  })

  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processedData, setProcessedData] = useState<ProcessedData[]>([])
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null)
  const [error, setError] = useState<string>("")

  const validateFile = (file: File, type: string): string | null => {
    const validExtensions = type === "mapping" ? [".xlsx", ".xls"] : [".csv", ".xlsx", ".xls"]
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!validExtensions.includes(extension)) {
      return `Invalid file format. Expected: ${validExtensions.join(", ")}`
    }

    if (file.size > 10 * 1024 * 1024) {
      return "File size too large. Maximum 10MB allowed."
    }

    return null
  }

  const handleFileDrop = useCallback((e: React.DragEvent, type: keyof typeof files) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]

    if (droppedFile) {
      const error = validateFile(droppedFile, type)
      setFiles((prev) => ({
        ...prev,
        [type]: {
          file: droppedFile,
          status: error ? "error" : "uploaded",
          error,
        },
      }))
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
    const selectedFile = e.target.files?.[0]

    if (selectedFile) {
      const error = validateFile(selectedFile, type)
      setFiles((prev) => ({
        ...prev,
        [type]: {
          file: selectedFile,
          status: error ? "error" : "uploaded",
          error,
        },
      }))
    }
  }, [])

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

      if (extension === ".csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error),
        })
      } else {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: "array" })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)
            resolve(jsonData)
          } catch (error) {
            reject(error)
          }
        }
        reader.readAsArrayBuffer(file)
      }
    })
  }

  const cleanNumericValue = (value: any): number => {
    if (typeof value === "number") return value
    if (typeof value === "string") {
      return Number.parseFloat(value.replace(/[₹,]/g, "")) || 0
    }
    return 0
  }

  const calculateSummaryStats = (data: ProcessedData[]): SummaryStats => {
    const dates = data.map((row) => new Date(row.date)).filter((date) => !isNaN(date.getTime()))
    const campaigns = new Set(data.map((row) => row.campaignName))
    const portfolios = new Set(data.map((row) => row.portfolioName))
    const categories = new Set(data.map((row) => row.category).filter(Boolean))

    return {
      totalRows: data.length,
      totalImpressions: data.reduce((sum, row) => sum + row.impressions, 0),
      totalClicks: data.reduce((sum, row) => sum + row.clicks, 0),
      totalSpend: data.reduce((sum, row) => sum + row.spend, 0),
      totalSales: data.reduce((sum, row) => sum + row.sales, 0),
      totalOrders: data.reduce((sum, row) => sum + row.orders, 0),
      dateRange: {
        start: dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))).toISOString().split("T")[0] : "",
        end: dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString().split("T")[0] : "",
      },
      uniqueCampaigns: campaigns.size,
      uniquePortfolios: portfolios.size,
      categoriesFound: categories.size,
    }
  }

  const processData = async () => {
    setProcessing(true)
    setProgress(0)
    setError("")
    setSummaryStats(null)

    try {
      const uploadedFiles = [
        { key: "sp", file: files.sp.file, name: "Sponsored Products" },
        { key: "sb", file: files.sb.file, name: "Sponsored Brands" },
        { key: "sd", file: files.sd.file, name: "Sponsored Display" },
      ].filter((f) => f.file !== null)

      if (uploadedFiles.length === 0) {
        throw new Error("Please upload at least 1 campaign file (SP, SB, or SD)")
      }

      setProgress(10)

      const filePromises = uploadedFiles.map((f) => parseFile(f.file!))
      if (files.mapping.file) {
        filePromises.push(parseFile(files.mapping.file))
      }

      const parsedResults = await Promise.all(filePromises)
      const parsedData: { [key: string]: any[] } = {}

      // Map results back to their file types
      uploadedFiles.forEach((f, index) => {
        parsedData[f.key] = parsedResults[index]
      })

      const mappingData = files.mapping.file ? parsedResults[uploadedFiles.length] : []

      setProgress(25)

      const validateColumns = (data: any[], type: keyof typeof REQUIRED_COLUMNS) => {
        if (data.length === 0) return
        const columns = Object.keys(data[0])
        const required = REQUIRED_COLUMNS[type]
        const missing = required.filter((col) => !columns.includes(col))
        if (missing.length > 0) {
          throw new Error(`Missing columns in ${type.toUpperCase()}: ${missing.join(", ")}`)
        }
      }

      uploadedFiles.forEach((f) => {
        validateColumns(parsedData[f.key], f.key as keyof typeof REQUIRED_COLUMNS)
      })

      setProgress(40)

      const categoryMap = new Map<string, string>()
      if (mappingData.length > 0) {
        mappingData.forEach((row: any) => {
          if (row["Campaign Name"] && row["Category"]) {
            categoryMap.set(row["Campaign Name"], row["Category"])
          }
        })
      }

      setProgress(55)

      const allData: ProcessedData[] = []

      const processRows = (data: any[], source: string) => {
        data.forEach((row) => {
          if (row["Date"] && row["Campaign Name"]) {
            allData.push({
              date: row["Date"],
              campaignName: row["Campaign Name"],
              portfolioName: row["Portfolio name"] || "",
              impressions: cleanNumericValue(row["Impressions"]),
              clicks: cleanNumericValue(row["Clicks"]),
              spend: cleanNumericValue(row["Spend"]),
              sales: cleanNumericValue(row["14 Day Total Sales (₹)"]),
              orders: cleanNumericValue(row["14 Day Total Orders (#)"]),
              category: categoryMap.get(row["Campaign Name"]) || "Uncategorized",
            })
          }
        })
      }

      uploadedFiles.forEach((f) => {
        processRows(parsedData[f.key], f.key.toUpperCase())
      })

      setProgress(75)

      const aggregatedMap = new Map<string, ProcessedData>()

      allData.forEach((row) => {
        const key = `${row.date}_${row.campaignName}_${row.portfolioName}`

        if (aggregatedMap.has(key)) {
          const existing = aggregatedMap.get(key)!
          existing.impressions += row.impressions
          existing.clicks += row.clicks
          existing.spend += row.spend
          existing.sales += row.sales
          existing.orders += row.orders
        } else {
          aggregatedMap.set(key, { ...row })
        }
      })

      const finalData = Array.from(aggregatedMap.values())

      finalData.sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
        if (dateCompare !== 0) return dateCompare
        return a.campaignName.localeCompare(b.campaignName)
      })

      setProgress(90)

      const stats = calculateSummaryStats(finalData)
      setSummaryStats(stats)

      setProcessedData(finalData)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during processing")
    } finally {
      setProcessing(false)
    }
  }

  const exportToCSV = () => {
    if (processedData.length === 0) {
      setError("No data to export")
      return
    }

    try {
      const headers = [
        "Date",
        "Campaign Name",
        "Portfolio Name",
        "Category",
        "Impressions",
        "Clicks",
        "Spend",
        "14 Day Total Sales (₹)",
        "14 Day Total Orders (#)",
      ]

      const csvRows = [headers.join(",")]

      processedData.forEach((row) => {
        const csvRow = [
          row.date,
          `"${row.campaignName.replace(/"/g, '""')}"`,
          `"${row.portfolioName.replace(/"/g, '""')}"`,
          `"${row.category || "Uncategorized"}"`,
          row.impressions,
          row.clicks,
          row.spend.toFixed(2),
          row.sales.toFixed(2),
          row.orders,
        ]
        csvRows.push(csvRow.join(","))
      })

      const csvContent = csvRows.join("\n")

      navigator.clipboard
        .writeText(csvContent)
        .then(() => {
          setError("✅ CSV data copied to clipboard! Open a text editor, paste (Ctrl+V), and save as .csv file")
        })
        .catch(() => {
          showDataInModal(csvContent, "CSV")
        })
    } catch (error) {
      console.error("CSV Export error:", error)
      setError(`CSV export failed: ${error}`)
    }
  }

  const exportToExcel = () => {
    if (processedData.length === 0) {
      setError("No data to export")
      return
    }

    try {
      const headers = [
        "Date",
        "Campaign Name",
        "Portfolio Name",
        "Category",
        "Impressions",
        "Clicks",
        "Spend",
        "14 Day Total Sales (₹)",
        "14 Day Total Orders (#)",
      ]

      const tsvRows = [headers.join("\t")]

      processedData.forEach((row) => {
        const tsvRow = [
          row.date,
          row.campaignName,
          row.portfolioName,
          row.category || "Uncategorized",
          row.impressions,
          row.clicks,
          row.spend.toFixed(2),
          row.sales.toFixed(2),
          row.orders,
        ]
        tsvRows.push(tsvRow.join("\t"))
      })

      const tsvContent = tsvRows.join("\n")

      navigator.clipboard
        .writeText(tsvContent)
        .then(() => {
          setError("✅ Excel data copied to clipboard! Open Excel, paste (Ctrl+V), and save as .xlsx file")
        })
        .catch(() => {
          showDataInModal(tsvContent, "Excel")
        })
    } catch (error) {
      console.error("Excel Export error:", error)
      setError(`Excel export failed: ${error}`)
    }
  }

  const showDataInModal = (content: string, type: string) => {
    const modal = document.createElement("div")
    modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `

    const modalContent = document.createElement("div")
    modalContent.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 16px;
    max-width: 90%;
    max-height: 90%;
    overflow: auto;
    box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  `

    modalContent.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px; font-weight: 600;">Copy ${type} Data</h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Select all text below and copy (Ctrl+C):</p>
    </div>
    <textarea 
      style="width: 100%; height: 400px; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; font-size: 12px; border: 2px solid #e5e7eb; border-radius: 8px; padding: 12px; resize: none;"
      readonly
    >${content}</textarea>
    <div style="margin-top: 20px; text-align: right;">
      <button 
        onclick="this.parentElement.parentElement.parentElement.remove()" 
        style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px;"
      >
        Close
      </button>
    </div>
  `

    modal.appendChild(modalContent)
    document.body.appendChild(modal)

    const textarea = modalContent.querySelector("textarea") as HTMLTextAreaElement
    setTimeout(() => textarea.select(), 100)
  }

  const FileUploadCard = ({
    type,
    title,
    description,
    acceptedFormats,
  }: {
    type: keyof typeof files
    title: string
    description: string
    acceptedFormats: string
  }) => {
    const fileData = files[type]

    return (
      <Card className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            {title}
            {fileData.status === "uploaded" && <CheckCircle className="h-4 w-4 text-emerald-600 ml-auto" />}
            {fileData.status === "error" && <AlertCircle className="h-4 w-4 text-red-600 ml-auto" />}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
              fileData.status === "uploaded"
                ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/50"
                : fileData.status === "error"
                  ? "border-red-300 bg-red-50 dark:bg-red-950/50"
                  : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50"
            }`}
            onDrop={(e) => handleFileDrop(e, type)}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload
              className={`mx-auto h-6 w-6 mb-2 ${
                fileData.status === "uploaded" ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-500"
              }`}
            />

            {fileData.file ? (
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{fileData.file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(fileData.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Drop file here or click to browse
                </p>
                <p className="text-xs text-gray-500">{acceptedFormats}</p>
              </div>
            )}

            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept={acceptedFormats}
              onChange={(e) => handleFileSelect(e, type)}
            />
          </div>

          {fileData.error && (
            <Alert className="mt-3 border-red-200 bg-red-50 dark:bg-red-950/50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700 dark:text-red-400">{fileData.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  const ComingSoonCard = ({ platform }: { platform: keyof typeof PLATFORMS }) => {
    const platformData = PLATFORMS[platform]
    const IconComponent = platformData.icon

    return (
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardContent className="p-8 text-center">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4`}
          >
            <IconComponent className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {platformData.name} Integration
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{platformData.description}</p>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Coming Soon
          </div>
        </CardContent>
      </Card>
    )
  }

  const uploadedCampaignFiles = [files.sp, files.sb, files.sd].filter((f) => f.status === "uploaded").length
  const hasAnyFile = uploadedCampaignFiles > 0
  const hasErrors = Object.values(files).some((f) => f.status === "error")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-6 mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100">Campaign Analytics Hub</h1>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full border-2 hover:scale-105 transition-all duration-200 w-12 h-12"
            >
              {theme === "dark" ? (
                <Sun className="h-6 w-6 text-yellow-500" />
              ) : (
                <Moon className="h-6 w-6 text-blue-600" />
              )}
            </Button>
          </div>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Process and analyze campaign reports from multiple e-commerce platforms. Upload your data, get insights, and
            export consolidated reports.
          </p>
        </div>

        {/* Platform Sections */}
        <Accordion type="single" collapsible defaultValue="amazon" className="space-y-6">
          {/* Amazon Section */}
          <AccordionItem value="amazon" className="border border-gray-200 dark:border-gray-800 rounded-lg">
            <AccordionTrigger className="hover:no-underline px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <ShoppingBag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Amazon Campaign Processor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Process Sponsored Products, Sponsored Brands, and Sponsored Display campaigns
                  </p>
                </div>
                <span className="ml-auto bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              {/* Amazon File Upload Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <FileUploadCard
                  type="sp"
                  title="Sponsored Products (SP)"
                  description="Upload your Sponsored Products campaign report"
                  acceptedFormats=".csv,.xlsx,.xls"
                />
                <FileUploadCard
                  type="sb"
                  title="Sponsored Brands (SB)"
                  description="Upload your Sponsored Brands campaign report"
                  acceptedFormats=".csv,.xlsx,.xls"
                />
                <FileUploadCard
                  type="sd"
                  title="Sponsored Display (SD)"
                  description="Upload your Sponsored Display campaign report"
                  acceptedFormats=".csv,.xlsx,.xls"
                />
                <FileUploadCard
                  type="mapping"
                  title="Category Mapping (Optional)"
                  description="Upload Excel file with Campaign Name and Category columns"
                  acceptedFormats=".xlsx,.xls"
                />
              </div>

              {/* Processing Section */}
              <Card className="mb-6 border border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className={`h-4 w-4 ${processing ? "animate-spin" : ""} text-blue-600`} />
                    Data Processing
                  </CardTitle>
                  <CardDescription>
                    Process and aggregate your campaign data{" "}
                    {uploadedCampaignFiles > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        ({uploadedCampaignFiles} file{uploadedCampaignFiles > 1 ? "s" : ""} uploaded
                        {files.mapping.status === "uploaded" ? " + mapping" : ""})
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {processing && (
                    <div className="mb-4">
                      <Progress value={progress} className="mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Processing... {progress}%</p>
                    </div>
                  )}

                  {error && (
                    <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-700 dark:text-amber-400">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    <Button
                      onClick={processData}
                      disabled={!hasAnyFile || hasErrors || processing}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Process Campaign Data"
                      )}
                    </Button>

                    {processedData.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          onClick={exportToExcel}
                          variant="outline"
                          className="border-gray-300 dark:border-gray-700 bg-transparent"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export to Excel ({processedData.length} rows)
                        </Button>
                        <Button
                          onClick={exportToCSV}
                          variant="outline"
                          className="border-gray-300 dark:border-gray-700 bg-transparent"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export to CSV
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Statistics */}
              {summaryStats && (
                <Card className="mb-6 border border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      Processing Summary
                    </CardTitle>
                    <CardDescription>Overview of your processed campaign data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {summaryStats.totalRows.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Rows</div>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {summaryStats.totalImpressions.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Impressions</div>
                      </div>
                      <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          ₹{summaryStats.totalSpend.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Spend</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          ₹{summaryStats.totalSales.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Sales</div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Date Range:</span>
                        <br />
                        <span className="text-gray-600 dark:text-gray-400">
                          {summaryStats.dateRange.start} to {summaryStats.dateRange.end}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Campaigns:</span>
                        <br />
                        <span className="text-gray-600 dark:text-gray-400">{summaryStats.uniqueCampaigns} unique</span>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Portfolios:</span>
                        <br />
                        <span className="text-gray-600 dark:text-gray-400">{summaryStats.uniquePortfolios} unique</span>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Categories:</span>
                        <br />
                        <span className="text-gray-600 dark:text-gray-400">{summaryStats.categoriesFound} mapped</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results Preview */}
              {processedData.length > 0 && (
                <Card className="border border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle>Processing Results</CardTitle>
                    <CardDescription>
                      Preview of your processed campaign data ({processedData.length} aggregated rows)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100">Date</th>
                            <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100">Campaign</th>
                            <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100">Portfolio</th>
                            <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100">Category</th>
                            <th className="text-right p-3 font-medium text-gray-900 dark:text-gray-100">Impressions</th>
                            <th className="text-right p-3 font-medium text-gray-900 dark:text-gray-100">Clicks</th>
                            <th className="text-right p-3 font-medium text-gray-900 dark:text-gray-100">Spend</th>
                            <th className="text-right p-3 font-medium text-gray-900 dark:text-gray-100">Sales</th>
                            <th className="text-right p-3 font-medium text-gray-900 dark:text-gray-100">Orders</th>
                          </tr>
                        </thead>
                        <tbody>
                          {processedData.slice(0, 10).map((row, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                            >
                              <td className="p-3 text-gray-900 dark:text-gray-100">{row.date}</td>
                              <td className="p-3 max-w-xs truncate font-medium text-gray-900 dark:text-gray-100">
                                {row.campaignName}
                              </td>
                              <td className="p-3 text-gray-600 dark:text-gray-400">{row.portfolioName}</td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {row.category}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono text-gray-900 dark:text-gray-100">
                                {row.impressions.toLocaleString()}
                              </td>
                              <td className="p-3 text-right font-mono text-gray-900 dark:text-gray-100">
                                {row.clicks.toLocaleString()}
                              </td>
                              <td className="p-3 text-right font-mono text-gray-900 dark:text-gray-100">
                                ₹{row.spend.toFixed(2)}
                              </td>
                              <td className="p-3 text-right font-mono text-gray-900 dark:text-gray-100">
                                ₹{row.sales.toFixed(2)}
                              </td>
                              <td className="p-3 text-right font-mono text-gray-900 dark:text-gray-100">
                                {row.orders}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {processedData.length > 10 && (
                        <div className="p-3 text-center bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm">
                          Showing first 10 rows of {processedData.length} total rows
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Other Platform Sections */}
          {(Object.keys(PLATFORMS) as Array<keyof typeof PLATFORMS>)
            .filter((key) => key !== "amazon")
            .map((platform) => (
              <AccordionItem
                key={platform}
                value={platform}
                className="border border-gray-200 dark:border-gray-800 rounded-lg"
              >
                <AccordionTrigger className="hover:no-underline px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800">
                      {React.createElement(PLATFORMS[platform].icon, {
                        className: "h-5 w-5 text-gray-600 dark:text-gray-400",
                      })}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {PLATFORMS[platform].name} Campaign Processor
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{PLATFORMS[platform].description}</p>
                    </div>
                    <span className="ml-auto bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full text-xs font-medium">
                      Coming Soon
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <ComingSoonCard platform={platform} />
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </div>
    </div>
  )
}
