import { Schema, model } from 'mongoose'
import { WaveData } from '../types'

const SurfForecastSchema = new Schema({
  year: Number,
  month: Number,
  day: Number,
  hour: Number,
  height: Number,
  period: Number,
  waveDirection: Number,
  wind: {
    speed: Number,
    direction: {
      angle: Number,
      letters: String,
    },
  },
  energy: String,
})

const SurfForecast = model('SurfForecast', SurfForecastSchema)

export class SurfForecastModel {
  static async getSurfForecasts({
    page,
    limit,
  }: {
    page: number
    limit: number
  }) {
    try {
      const forecast: WaveData[] = await SurfForecast.find()
        .sort({ year: -1, month: -1, day: -1, hour: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-__v')
      return forecast
    } catch (err) {
      throw new Error("Couldn't get forecasts from the database")
    }
  }

  static async getLastForecast() {
    try {
      const lastData: WaveData | null = await SurfForecast.findOne()
        .sort({ _id: -1 })
        .select('-_id -__v')
      return lastData
    } catch (err) {
      throw new Error("Couldn't get last forecast data from the database")
    }
  }

  static async addMultipleForecast(forecast: WaveData[]) {
    try {
      forecast.forEach(async (data) => {
        const { day, hour, month, year } = data
        await SurfForecast.findOneAndUpdate(
          {
            day,
            hour,
            month,
            year,
          },
          data,
          {
            upsert: true,
          },
        )
      })
    } catch (err) {
      throw new Error("Couldn't add multiple forecasts to the database")
    }
  }
}
