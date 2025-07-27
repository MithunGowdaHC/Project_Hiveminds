"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Upload,
  FileText,
  X,
  Loader2,
  Download,
  Table,
  AlertCircle,
  CheckCircle,
  Info,
  Merge,
  FileSpreadsheet,
} from "lucide-react"
import * as XLSX from "xlsx"
import Papa from "papaparse"

interface UploadedFile {
  file: File
  id: string
  status: "uploading" | "ready" | "error"
  error?: string
  preview?: any[]
  headers?: string[]
}

interface CollatedData {
  headers: string[]
  rows: any[]
  totalRows: number
  sourceFiles: string[]
}

export function ExcelCollationTool() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [columnNames, setColumnNames] = useState("")
  const [isCollating, setIsCollating] = useState(false)
  const [collatedData, setCollatedData] = useState<CollatedData | null>(null)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)

  const MAX_FILES = 10

  const validateFile = (file: File): string | null => {
    const validExtensions = [".xlsx", ".xls", ".csv"]
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!validExtensions.includes(extension)) {
      return `Invalid file format. Expected: ${validExtensions.join(", ")}`
    }

    if (file.size > 25 * 1024 * 1024) {
      return "File size too large. Maximum 25MB allowed."
    }

    return null
  }

  const parseFile = async (file: File): Promise<{ data: any[]; headers: string[] }> => {
    return new Promise((resolve, reject) => {
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

      if (extension === ".csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = results.meta.fields || []
            resolve({ data: results.data, headers })
          },
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
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

            if (jsonData.length === 0) {
              reject(new Error("Empty file"))
              return
            }

            const headers = (jsonData[0] as string[]).map((h) => String(h).trim())
            const rows = jsonData.slice(1).map((row: any) => {
              const obj: any = {}
              headers.forEach((header, index) => {
                obj[header] = row[index] || ""
              })
              return obj
            })

            resolve({ data: rows, headers })
          } catch (error) {
            reject(error)
          }
        }
        reader.readAsArrayBuffer(file)
      }
    })
  }

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      handleFileUpload(files)
    },
    [uploadedFiles],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      handleFileUpload(files)
    },
    [uploadedFiles],
  )

  const handleFileUpload = async (files: File[]) => {
    if (uploadedFiles.length + files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed. You can upload ${MAX_FILES - uploadedFiles.length} more files.`)
      return
    }

    setError("")

    const newFiles: UploadedFile[] = files.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: "uploading" as const,
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Process each file
    for (const newFile of newFiles) {
      try {
        const validationError = validateFile(newFile.file)
        if (validationError) {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === newFile.id ? { ...f, status: "error", error: validationError } : f)),
          )
          continue
        }

        const { data, headers } = await parseFile(newFile.file)

        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === newFile.id ? { ...f, status: "ready", preview: data.slice(0, 5), headers } : f)),
        )
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === newFile.id ? { ...f, status: "error", error: "Failed to parse file" } : f)),
        )
      }
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const normalizeValue = (value: any): any => {
    if (value === null || value === undefined || value === "") return ""

    const str = String(value).trim()

    // Try to convert to number if it looks like a number
    if (/^-?\d+\.?\d*$/.test(str)) {
      const num = Number(str)
      if (!isNaN(num)) return num
    }

    return str
  }

  const collateFiles = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one file")
      return
    }

    if (!columnNames.trim()) {
      setError("Please specify column names to collate")
      return
    }

    const readyFiles = uploadedFiles.filter((f) => f.status === "ready")
    if (readyFiles.length === 0) {
      setError("No valid files to collate")
      return
    }

    setIsCollating(true)
    setError("")
    setProgress(0)

    try {
      // Parse column names
      const requestedColumns = columnNames
        .split(/[,\n]/)
        .map((col) => col.trim())
        .filter((col) => col.length > 0)

      if (requestedColumns.length === 0) {
        throw new Error("Please specify at least one column name")
      }

      setProgress(20)

      // Re-parse all files to get full data
      const allData: any[] = []
      const sourceFiles: string[] = []
      const missingColumns: { file: string; missing: string[] }[] = []
      const duplicateTracker = new Set<string>() // Track unique rows

      for (let i = 0; i < readyFiles.length; i++) {
        const fileData = readyFiles[i]
        setProgress(20 + (i / readyFiles.length) * 60)

        const { data, headers } = await parseFile(fileData.file)

        // Check for missing columns (case-insensitive)
        const normalizedHeaders = headers.map((h) => h.toLowerCase().trim())
        const missing = requestedColumns.filter((col) => !normalizedHeaders.includes(col.toLowerCase().trim()))

        if (missing.length > 0) {
          missingColumns.push({ file: fileData.file.name, missing })
        }

        // Extract and normalize requested columns
        data.forEach((row) => {
          // Skip completely empty rows
          const hasData = Object.values(row).some(
            (val) => val !== null && val !== undefined && String(val).trim() !== "",
          )
          if (!hasData) return

          const normalizedRow: any = {}
          let rowKey = "" // Create unique key for duplicate detection

          requestedColumns.forEach((requestedCol) => {
            // Find matching header (case-insensitive)
            const matchingHeader = headers.find((h) => h.toLowerCase().trim() === requestedCol.toLowerCase().trim())

            if (matchingHeader) {
              const value = normalizeValue(row[matchingHeader])
              normalizedRow[requestedCol] = value
              rowKey += `${requestedCol}:${value}|` // Build unique key
            } else {
              normalizedRow[requestedCol] = ""
              rowKey += `${requestedCol}:|`
            }
          })

          // Add source file info
          normalizedRow._sourceFile = fileData.file.name
          rowKey += `source:${fileData.file.name}` // Include source in key

          // Only add if not duplicate
          if (!duplicateTracker.has(rowKey)) {
            duplicateTracker.add(rowKey)
            allData.push(normalizedRow)
          }
        })

        sourceFiles.push(fileData.file.name)
      }

      if (missingColumns.length > 0) {
        const errorMsg = missingColumns
          .map(({ file, missing }) => `${file}: missing columns [${missing.join(", ")}]`)
          .join("\n")
        throw new Error(`Missing columns in files:\n${errorMsg}`)
      }

      setProgress(85)

      // Sort by first column
      if (requestedColumns.length > 0) {
        allData.sort((a, b) => {
          const aVal = a[requestedColumns[0]]
          const bVal = b[requestedColumns[0]]

          if (typeof aVal === "number" && typeof bVal === "number") {
            return aVal - bVal
          }

          return String(aVal).localeCompare(String(bVal))
        })
      }

      setProgress(100)

      const result: CollatedData = {
        headers: [...requestedColumns, "Source File"],
        rows: allData.map((row) => [...requestedColumns.map((col) => row[col]), row._sourceFile]),
        totalRows: allData.length, // This should now be accurate
        sourceFiles,
      }

      setCollatedData(result)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to collate files")
    } finally {
      setIsCollating(false)
      setProgress(0)
    }
  }

  const copyToClipboard = () => {
    if (!collatedData) return

    try {
      // Create TSV format for Excel compatibility
      const tsvRows = [collatedData.headers.join("\t")]

      collatedData.rows.forEach((row) => {
        const tsvRow = row.map((cell) => {
          // Handle cells that might contain tabs or newlines
          const cellStr = String(cell || "")
          if (cellStr.includes("\t") || cellStr.includes("\n")) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        })
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
      console.error("Copy to clipboard error:", error)
      setError(`Failed to copy data: ${error}`)
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

  const readyFilesCount = uploadedFiles.filter((f) => f.status === "ready").length

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            File Upload
            <span className="text-sm font-normal text-gray-500">
              ({uploadedFiles.length}/{MAX_FILES} files)
            </span>
          </CardTitle>
          <CardDescription>Upload Excel files (.xlsx, .xls) or CSV files. Maximum 10 files, 25MB each.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Drop Excel files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">Supports .xlsx, .xls, and .csv files</p>
            <input
              type="file"
              multiple
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={uploadedFiles.length >= MAX_FILES}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={uploadedFiles.length >= MAX_FILES}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Uploaded Files:</h4>
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{file.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        {file.headers && ` • ${file.headers.length} columns`}
                        {file.preview && ` • ${file.preview.length}+ rows`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                    {file.status === "ready" && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {file.status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Column Selection */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5 text-purple-600" />
            Column Selection
          </CardTitle>
          <CardDescription>
            Specify which columns to merge from your uploaded files. Column names must match exactly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="columns">Column Names</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Enter column names separated by commas or new lines. Names must exactly match what's in your
                        files (case-insensitive).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="columns"
                placeholder={`Enter column names (one per line or comma-separated):\n\nDate\nCampaign Name\nSpend\nSales\nImpressions`}
                value={columnNames}
                onChange={(e) => setColumnNames(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
            </div>

            {/* Show available columns from uploaded files */}
            {readyFilesCount > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Available Columns in Your Files:</h4>
                <div className="space-y-2">
                  {uploadedFiles
                    .filter((f) => f.status === "ready" && f.headers)
                    .map((file) => (
                      <div key={file.id} className="text-sm">
                        <span className="font-medium text-blue-800 dark:text-blue-200">{file.file.name}:</span>
                        <span className="ml-2 text-blue-700 dark:text-blue-300">{file.headers?.join(", ")}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Collation Controls */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5 text-green-600" />
            Data Collation
          </CardTitle>
          <CardDescription>Merge your uploaded files based on the specified columns.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-950/50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-400 whitespace-pre-line">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isCollating && (
            <div className="mb-4">
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Processing files... {progress}%</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={collateFiles}
              disabled={readyFilesCount === 0 || !columnNames.trim() || isCollating}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              {isCollating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Collating...
                </>
              ) : (
                <>
                  <Merge className="mr-2 h-4 w-4" />
                  Collate Files ({readyFilesCount} files)
                </>
              )}
            </Button>

            {collatedData && (
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 bg-transparent"
              >
                <Download className="mr-2 h-4 w-4" />
                Copy to Excel ({collatedData.totalRows} rows)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Preview */}
      {collatedData && (
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Collation Results
            </CardTitle>
            <CardDescription>
              Successfully merged {collatedData.totalRows} rows from {collatedData.sourceFiles.length} files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {collatedData.totalRows.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Rows</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {collatedData.headers.length - 1}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Merged Columns</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {collatedData.sourceFiles.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Source Files</div>
              </div>
            </div>

            {/* Data Preview */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {collatedData.headers.map((header, index) => (
                      <th key={index} className="text-left p-3 font-medium text-gray-900 dark:text-gray-100">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {collatedData.rows.slice(0, 10).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    >
                      {row.map((cell: any, cellIndex: number) => (
                        <td key={cellIndex} className="p-3 text-gray-900 dark:text-gray-100">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {collatedData.rows.length > 10 && (
                <div className="p-3 text-center bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm">
                  Showing first 10 rows of {collatedData.totalRows} total rows
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
