import express, { json } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { buoysRouter } from './routes/buoys'
import { scrapeRouter } from './routes/scrape'
import { SurfForecastRouter } from './routes/surf-forecast'
const { PORT = 3000, MONGO_URL } = process.env

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

let cachedDb: mongoose.Mongoose | null = null

const connectToDatabase = async () => {
  if (cachedDb) {
    console.log('Using existing database connection')
    return cachedDb
  }

  try {
    const connection = await mongoose.connect(MONGO_URL, {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    })

    cachedDb = connection
    console.log('Connected to database')
    return connection
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
    throw err
  }
}

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to start app due to DB connection failure', err)
    process.exit(1)
  })
