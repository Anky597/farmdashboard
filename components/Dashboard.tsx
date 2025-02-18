"use client"

import { useState, useEffect, useCallback } from "react"
import FieldSection from "./FieldSection"
import FieldSummary from "./FieldSummary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { RefreshCw, AlertCircle } from "lucide-react"
import { fetchFieldData, fetchChannelStatus } from "@/utils/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const [fieldsData, setFieldsData] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [channelStatus, setChannelStatus] = useState(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [data, status] = await Promise.all([fetchFieldData(), fetchChannelStatus()])
      setFieldsData(data)
      setChannelStatus(status)
      setLastUpdated(new Date())
      toast({
        title: "Data refreshed",
        description: "The dashboard has been updated with the latest data.",
      })
    } catch (err) {
      setError(err.message || "Failed to fetch data. Please try again later.")
      console.error("Error fetching data:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to fetch data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 50000) // Fetch data every 50 seconds
    return () => clearInterval(interval)
  }, [fetchData])

  const handleRefresh = () => {
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {lastUpdated.toLocaleString()}</p>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!error && channelStatus === null && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Unable to fetch channel status. Some data may be unavailable.</AlertDescription>
        </Alert>
      )}
      {channelStatus && (
        <Alert>
          <AlertTitle>Channel Status</AlertTitle>
          <AlertDescription>
            Last entry ID: {channelStatus.last_entry_id}, Created at:{" "}
            {new Date(channelStatus.created_at).toLocaleString()}, Updated at:{" "}
            {new Date(channelStatus.updated_at).toLocaleString()}
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-[150px]" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[180px]" />
                    </div>
                  </CardContent>
                </Card>
              ))
          : fieldsData.map((field) => (
              <FieldSection key={field.id} field={field} onClick={() => setSelectedField(field)} />
            ))}
      </div>
      {selectedField && <FieldSummary field={selectedField} onClose={() => setSelectedField(null)} />}
    </div>
  )
}

