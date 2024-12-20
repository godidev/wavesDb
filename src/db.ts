import mongoose, { Connection } from 'mongoose'

let cachedDb: Connection | null = null

export const connectToDatabase = async (
  mongoUrl: string,
): Promise<Connection> => {
  if (cachedDb) {
    console.log('Using existing database connection')
    return cachedDb
  }

  try {
    const connection = await mongoose.connect(mongoUrl, {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 5000,
    })

    cachedDb = connection.connection
    console.log('Connected to database')
    return cachedDb
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
    throw err
  }
}
