import { Schema, model } from 'mongoose'
import { station } from '../types'

const stationSchema = new Schema({
  name: String,
  station: String,
})

const Station = model('Station', stationSchema)

export class StationModel {
  static async getStations() {
    try {
      const stations: station[] = await Station.find({}).select('-_id -__v')
      return stations
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(
          `Couldn't get stations from the database. Original error: ${err.message}`,
        )
      } else {
        throw new Error(
          "Couldn't get stations from the database, and the error is not an instance of Error.",
        )
      }
    }
  }

  static async deleteStations() {
    try {
      await Station.deleteMany()
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(
          `Couldn't delete stations from the database. Original error: ${err.message}`,
        )
      } else {
        throw new Error(
          "Couldn't delete stations from the database, and the error is not an instance of Error.",
        )
      }
    }
  }

  static async addStation(station: station) {
    try {
      const data = await Station.insertMany(station)
      return data
    } catch (err) {
      if (err instanceof Error) {
        throw new Error("Couldn't add multiple stations to the database")
      }
    }
  }
}
