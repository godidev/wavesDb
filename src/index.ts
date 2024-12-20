import express, { json, Request, Response } from 'express'
import cors from 'cors'
import { buoysRouter } from './routes/buoys'
import { scrapeRouter } from './routes/scrape'
import { SurfForecastRouter } from './routes/surf-forecast'
import { connectToDatabase } from './db'
const { MONGO_URL } = process.env

if (!MONGO_URL) {
  console.error(
    'MONGO_URL is not defined. Please check your environment variables.',
  )
  process.exit(1)
}

const app = express()

app.use(cors({ origin: '*' }))
app.use(json())

app.use('/buoys', buoysRouter)
app.use('/scrape', scrapeRouter)
app.use('/surf-forecast', SurfForecastRouter)

connectToDatabase(MONGO_URL).catch((err) => {
  console.error('Failed to connect to database:', err)
  process.exit(1)
})

module.exports = (req: Request, res: Response) => {
  app(req, res)
}
