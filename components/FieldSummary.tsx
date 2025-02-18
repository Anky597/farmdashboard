"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from "recharts"
import { fetchSingleFieldData } from "@/utils/api"
import { Loader2 } from "lucide-react"

interface FieldSummaryProps {
  field: {
    id: number
    name: string
    temperature: number
    humidity: number
    soilMoisture: number
  }
  onClose: () => void
}

export default function FieldSummary({ field, onClose }: FieldSummaryProps) {
  const [historicalData, setHistoricalData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const fieldOffset = (field.id - 1) * 3
        const fetchPromises = [fetchSingleFieldData(fieldOffset + 1), fetchSingleFieldData(fieldOffset + 2)]

        // Only fetch soil moisture data for Field 1 and Field 2
        if (field.id < 3) {
          fetchPromises.push(fetchSingleFieldData(fieldOffset + 3))
        }

        const [temperatureData, humidityData, soilMoistureData = []] = await Promise.all(fetchPromises)

        const combinedData = temperatureData.map((temp, index) => ({
          index,
          temperature: temp,
          humidity: humidityData[index],
          soilMoisture: soilMoistureData[index] || 0,
        }))

        setHistoricalData(combinedData)
      } catch (error) {
        console.error("Error fetching historical data:", error)
        setHistoricalData([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [field.id])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 border rounded-lg shadow-lg">
          <p className="font-bold">{`Data point: ${label}`}</p>
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{field.name} Summary</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{field.temperature.toFixed(1)}°C</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Humidity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{field.humidity.toFixed(1)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Soil Moisture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{field.soilMoisture.toFixed(1)}%</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="charts">
            <Card>
              <CardHeader>
                <CardTitle>Historical Data</CardTitle>
                <CardDescription>
                  View the trends of temperature, humidity, and soil moisture over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="index" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ef4444"
                        name="Temperature (°C)"
                      />
                      <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidity (%)" />
                      {field.id < 3 && (
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="soilMoisture"
                          fill="#22c55e"
                          stroke="#22c55e"
                          name="Soil Moisture (%)"
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

