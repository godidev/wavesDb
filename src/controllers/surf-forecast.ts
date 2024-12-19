import { SurfForecastModel } from '../models/surf-forecast'
import { WaveData } from '../types'
import { scheduledUpdate } from '../utils/surfForecast'
import { Request, Response } from 'express'

export class SurfForecastController {
  static async getSurfForecasts(req: Request, res: Response) {
    try {
      const { page, limit } = req.query
      const pageNumber = page ? Number(page) : 1 // Default to 1 if undefined or invalid
      const limitNumber = limit ? Number(limit) : 10 // Default to 10 if undefined or invalid

      const forecasts = await SurfForecastModel.getSurfForecasts({
        page: pageNumber,
        limit: limitNumber,
      })
      res.json(forecasts)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: err })
    }
  }

  static async addNewForecasts(req: Request, res: Response) {
    try {
      await scheduledUpdate()
      res.status(200).send('Forecast data updated successfully!')
    } catch (err) {
      res.status(500).json({ error: err })
    }
  }

  static async fetchSurfForecast(req: Request, res: Response) {
    try {
      const retrieved = (await scheduledUpdate()) as unknown as WaveData[]
      await SurfForecastModel.addMultipleForecast(retrieved)
      res.json({ message: 'Forecast data updated successfully!' })
    } catch (err) {
      res.status(500).json({ error: err })
    }
  }
}
