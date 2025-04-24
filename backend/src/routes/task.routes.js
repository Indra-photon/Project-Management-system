import {Router} from 'express'
import { verifyJWT } from '../middlewares/verifyJWT.middlewares.js'
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from '../controllers/task.controllers.js'

const router = Router()
router.route("/create-task").post(verifyJWT, createTask)
router.route("/delete-task/:id").delete(verifyJWT, deleteTask)      
router.route("/update-task/:id").patch(verifyJWT, updateTask)
router.route("/get-all-tasks").get(verifyJWT, getAllTasks)
router.route("/get-task-by-id/:id").get(verifyJWT, getTaskById) 


export default router