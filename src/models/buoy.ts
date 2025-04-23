import { Schema, model } from 'mongoose'
import { buoyFetchDatos, formatedBuoys } from '../types'

const buoySchema = new Schema({
  station: { type: String, required: true },
  date: Date,
  period: Number,
  height: Number,
  avgDirection: Number,
  peakDirection: Number,
  tm02: Number,
})

const Buoy = model('Buoy', buoySchema)

export class BuoyModel {
  static async getBuoys({ limit, buoy }: { limit: number; buoy?: string }) {
    try {
      const buoys: formatedBuoys[] = await Buoy.find({ station: buoy })
        .sort({ date: -1 })
        .limit(limit)
        .select('-_id -__v')
      return buoys
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(
          `Couldn't get buoys from the database. Original error: ${err.message}`,
        )
      } else {
        throw new Error(
          "Couldn't get buoys from the database, and the error is not an instance of Error.",
        )
      }
    }
  }

  static async deleteBuoys() {
    try {
      await Buoy.deleteMany()
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(
          `Couldn't delete buoys from the database. Original error: ${err.message}`,
        )
      } else {
        throw new Error(
          "Couldn't delete buoys from the database, and the error is not an instance of Error.",
        )
      }
    }
  }

  static async getLastBuoy() {
    try {
      const lastBuoyData = await Buoy.findOne()
        .sort({ _id: -1 })
        .select('-_id -__v')
      if (!lastBuoyData) {
        throw new Error('No buoy data found')
      }
      return lastBuoyData
    } catch (err) {
      if (err instanceof Error) {
        throw new Error("Couldn't get last buoy data from the database")
      }
    }
  }

  static async addBuoy(buoys: buoyFetchDatos) {
    try {
      const data = await Buoy.insertMany(buoys)
      return data
    } catch (err) {
      if (err instanceof Error) {
        throw new Error("Couldn't add multiple buoys to the database")
      }
    }
  }

  static async addMultipleBuoys(station: string, buoys: formatedBuoys[]) {
    try {
      const bulkOps = buoys.map(({ date, ...rest }) => ({
        updateOne: {
          filter: { station, date },
          update: { date, ...rest },
          upsert: true,
        },
      }))
      await Buoy.bulkWrite(bulkOps)
    } catch (err) {
      if (err instanceof Error) {
        throw new Error("Couldn't add multiple buoys to the database")
      }
    }
  }
}
