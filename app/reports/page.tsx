"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/DatePickerWithRange"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchHistoricalData } from "@/utils/api"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ReportsPage() {
  const [selectedField, setSelectedField] = useState("1")
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() })
  const [reportData, setReportData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [selectedField, dateRange]) //This line was already correct

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      const data = await fetchHistoricalData(days)
      setReportData(data.filter((item) => new Date(item.date) >= dateRange.from && new Date(item.date) <= dateRange.to))
    } catch (err) {
      console.error("Error fetching report data:", err)
      setError("Failed to fetch report data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 border rounded-lg shadow-lg">
          <p className="font-bold">{`Date: ${label}`}</p>
          {payload.map((pld: any) => (
            <p key={pld.dataKey} style={{ color: pld.color }}>
              {`${pld.name}: ${pld.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <Select value={selectedField} onValueChange={setSelectedField}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Field 1</SelectItem>
            <SelectItem value="2">Field 2</SelectItem>
            <SelectItem value="3">Field 3</SelectItem>
          </SelectContent>
        </Select>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        <Button onClick={fetchData}>Generate Report</Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Field {selectedField} Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey={`field${selectedField}Temperature`}
                      stroke="#ef4444"
                      name="Temperature (°C)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={`field${selectedField}Humidity`}
                      stroke="#3b82f6"
                      name="Humidity (%)"
                    />
                    {selectedField !== "3" && (
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey={`field${selectedField}SoilMoisture`}
                        fill="#22c55e"
                        stroke="#22c55e"
                        name="Soil Moisture (%)"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
            <TabsContent value="table">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Temperature (°C)</th>
                      <th className="px-4 py-2 text-left">Humidity (%)</th>
                      {selectedField !== "3" && <th className="px-4 py-2 text-left">Soil Moisture (%)</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row) => (
                      <tr key={row.date}>
                        <td className="border px-4 py-2">{row.date}</td>
                        <td className="border px-4 py-2">
                          {row[`field${selectedField}Temperature`]?.toFixed(1) ?? "N/A"}
                        </td>
                        <td className="border px-4 py-2">
                          {row[`field${selectedField}Humidity`]?.toFixed(1) ?? "N/A"}
                        </td>
                        {selectedField !== "3" && (
                          <td className="border px-4 py-2">
                            {row[`field${selectedField}SoilMoisture`]?.toFixed(1) ?? "N/A"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

