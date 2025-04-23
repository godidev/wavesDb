import mongoose, { Connection } from 'mongoose'

export const connectToDatabase = async (
  mongoUrl: string,
): Promise<Connection> => {
  try {
    const connection = await mongoose.connect(mongoUrl, {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 5000,
    })

    return connection.connection
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
    throw err
  }
}
