import { StationModel } from '../models/station'
import { Request, Response } from 'express'

export class stationController {
  static async getStations(req: Request, res: Response) {
    try {
      const stations = await StationModel.getStations()
      res.json(stations)
    } catch (err) {
      res.status(500).json({ error: err })
    }
  }

  static async addNewStation(req: Request, res: Response) {
    try {
      const { name, station } = req.body
      console.log({ name, station })
      const response = await StationModel.addStation({ name, station })
      res.status(200).send('Station data updated successfully!')
    } catch (err) {
      res.status(500).json({ error: err })
    }
  }

  static async deleteStations(req: Request, res: Response) {
    try {
      await StationModel.deleteStations()
      res.status(200).send('Station data deleted successfully!')
    } catch (err) {
      res.status(500).json({ error: err })
    }
  }
}
