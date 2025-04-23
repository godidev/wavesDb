import express, { json } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { buoysRouter } from './routes/buoys'
import { scrapeRouter } from './routes/scrape'
import { SurfForecastRouter } from './routes/surf-forecast'
import { stationsRouter } from './routes/stations'
const { PORT = 3000, MONGO_URL } = process.env

if (!MONGO_URL) {
  console.error(
    'MONGO_URL is not defined. Please check your environment variables.',
  )
  process.exit(1) // Exit the process if MONGO_URL is not set
}

const app = express()
app.use(cors({ origin: '*' }))

app.use(json())

app.use('/buoys', buoysRouter)
app.use('/scrape', scrapeRouter)
app.use('/stations', stationsRouter)
app.use('/surf-forecast', SurfForecastRouter)

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('Connected to database')
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`)
    })
  })
  .catch((err) => console.error(err))
