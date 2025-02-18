import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Sprout } from "lucide-react"

interface FieldProps {
  field: {
    id: number
    name: string
    temperature: number
    humidity: number
    soilMoisture: number
  }
  onClick: () => void
}

export default function FieldSection({ field, onClick }: FieldProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <CardTitle className="text-lg">{field.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">{field.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{field.humidity.toFixed(1)}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Sprout className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{field.soilMoisture.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

