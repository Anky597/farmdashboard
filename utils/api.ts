import axios from "axios"
import axiosRetry from "axios-retry"

const THINGSPEAK_API_KEY = process.env.NEXT_PUBLIC_THINGSPEAK_API_KEY
const THINGSPEAK_CHANNEL_ID = process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID

interface FieldData {
  id: number
  name: string
  temperature: number
  humidity: number
  soilMoisture: number
}

const api = axios.create({
  baseURL: "https://api.thingspeak.com",
  timeout: 10000, // 10 seconds timeout
  params: {
    api_key: THINGSPEAK_API_KEY,
  },
})

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === "ECONNABORTED"
  },
})

export async function fetchFieldData(): Promise<FieldData[]> {
  try {
    const response = await api.get(`/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json`, {
      params: {
        results: 1, // Get the latest reading
      },
    })

    if (response.data && response.data.feeds && response.data.feeds.length > 0) {
      const latestFeed = response.data.feeds[0]

      return [
        {
          id: 1,
          name: "Field 1",
          temperature: Number.parseFloat(latestFeed.field1) || 0,
          humidity: Number.parseFloat(latestFeed.field2) || 0,
          soilMoisture: Number.parseFloat(latestFeed.field3) || 0,
        },
        {
          id: 2,
          name: "Field 2",
          temperature: Number.parseFloat(latestFeed.field4) || 0,
          humidity: Number.parseFloat(latestFeed.field5) || 0,
          soilMoisture: Number.parseFloat(latestFeed.field6) || 0,
        },
        {
          id: 3,
          name: "Field 3",
          temperature: Number.parseFloat(latestFeed.field7) || 0,
          humidity: Number.parseFloat(latestFeed.field8) || 0,
          soilMoisture: 0, // Assuming no data for soil moisture in Field 3
        },
      ]
    } else {
      console.error("No data available from ThingSpeak")
      return []
    }
  } catch (error) {
    console.error("Error fetching field data:", error)
    throw new Error("Failed to fetch field data. Please check your internet connection and try again.")
  }
}

export async function fetchHistoricalData(days = 7): Promise<any[]> {
  try {
    const response = await api.get(`/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json`, {
      params: {
        days: days,
      },
    })

    if (response.data && response.data.feeds && response.data.feeds.length > 0) {
      return response.data.feeds.map((feed: any) => ({
        date: new Date(feed.created_at).toISOString().split("T")[0],
        field1Temperature: Number.parseFloat(feed.field1) || 0,
        field1Humidity: Number.parseFloat(feed.field2) || 0,
        field1SoilMoisture: Number.parseFloat(feed.field3) || 0,
        field2Temperature: Number.parseFloat(feed.field4) || 0,
        field2Humidity: Number.parseFloat(feed.field5) || 0,
        field2SoilMoisture: Number.parseFloat(feed.field6) || 0,
        field3Temperature: Number.parseFloat(feed.field7) || 0,
        field3Humidity: Number.parseFloat(feed.field8) || 0,
      }))
    } else {
      console.error("No historical data available from ThingSpeak")
      return []
    }
  } catch (error) {
    console.error("Error fetching historical data:", error)
    throw new Error("Failed to fetch historical data. Please check your internet connection and try again.")
  }
}

export async function fetchChannelStatus(): Promise<any> {
  try {
    const response = await api.get(`/channels/${THINGSPEAK_CHANNEL_ID}/status.json`)

    if (response.data) {
      return response.data
    } else {
      console.error("No status data available from ThingSpeak")
      return null
    }
  } catch (error) {
    console.error("Error fetching channel status:", error)
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error("The request timed out. Please try again later.")
      } else if (error.response) {
        throw new Error(`Server responded with status code ${error.response.status}. Please try again later.`)
      } else if (error.request) {
        throw new Error("No response received from the server. Please check your internet connection and try again.")
      }
    }
    throw new Error("An unexpected error occurred. Please try again later.")
  }
}

export async function fetchSingleFieldData(fieldNumber: number): Promise<number[]> {
  try {
    const response = await api.get(`/channels/${THINGSPEAK_CHANNEL_ID}/fields/${fieldNumber}.json`, {
      params: {
        results: 100, // Fetch last 100 datapoints
      },
    })

    if (response.data && response.data.feeds && response.data.feeds.length > 0) {
      return response.data.feeds.map((feed: any) => Number.parseFloat(feed[`field${fieldNumber}`]) || 0)
    } else {
      console.error(`No data available for field ${fieldNumber} from ThingSpeak`)
      return []
    }
  } catch (error) {
    console.error(`Error fetching data for field ${fieldNumber}:`, error)
    throw new Error(
      `Failed to fetch data for field ${fieldNumber}. Please check your internet connection and try again.`,
    )
  }
}

