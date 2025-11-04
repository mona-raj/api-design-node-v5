import express from 'express'
import authRoutes from './routes/authRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import habitRoutes from './routes/habitRoutes.ts'
import cors from 'cors' // cross origin resource sharing
import helmet from 'helmet' // security
import morgan from 'morgan' // request logs
import { isTest } from '../env.ts'

const app = express()

app.use(helmet()) // Higher order function
app.use(cors()) // global middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  morgan('dev', {
    skip: () => isTest(),
  })
)

app.get('/health', (req, res) => {
  res.json({ message: 'hello' }).status(200)
})

// mounting
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/habits', habitRoutes)

export { app }

export default app
