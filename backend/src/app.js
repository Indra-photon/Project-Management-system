// import express from 'express'
// import dotenv from 'dotenv'
// import cors from 'cors'
// import db from './db/index.js'
// import cookieParser from 'cookie-parser'
// import { errorHandler } from './middlewares/error.middlewares.js'

// dotenv.config()

// const app = express()
// app.use(cors({
//     origin : process.env.BASE_URL,
//     credentials: true,
//     methods : ['GET','POST','DELETE','OPTIONS'],
//     allowedHeaders : ['Content-Type', 'Authorization']
// }))
// app.use(express.json())
// app.use(express.urlencoded({extended:true}))
// app.use(cookieParser())

// const port = process.env.PORT || 4000

// db();

// import healthCheckRouter from './routes/healthcheck.routes.js'
// import userRoutes from './routes/auth.routes.js'
// import projectRoutes from './routes/project.routes.js'


// app.use("/api/v1/healthcheck", healthCheckRouter)
// app.use("/api/v1/users", userRoutes)
// app.use("/api/v1/projects", projectRoutes)

// app.use(errorHandler)


// app.listen(port, () => {
//     console.log(`app listening on port ${port}`);
    
// })

// export default app

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import db from './db/index.js'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/error.middlewares.js'

dotenv.config()

const app = express()

app.use(cors({
    origin : process.env.BASE_URL,
    credentials: true,
    methods : ['GET','POST','DELETE','OPTIONS'],
    allowedHeaders : ['Content-Type', 'Authorization', 'X-API-Key']
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

const port = process.env.PORT || 4000

db();

import healthCheckRouter from './routes/healthcheck.routes.js'
import userRoutes from './routes/auth.routes.js'
import projectRoutes from './routes/project.routes.js'
import taskRoutes from './routes/task.routes.js'
import noteRoutes from './routes/notes.routes.js'

app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/projects", projectRoutes)
app.use("/api/v1/tasks", taskRoutes)
app.use("/api/v1/notes", noteRoutes)

app.use(errorHandler)

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
})

export default app