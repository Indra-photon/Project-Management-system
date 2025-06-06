import {Router} from 'express'
import { verify } from '../middlewares/verify.middlewares.js'
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from '../controllers/task.controllers.js'

const router = Router()
router.route("/create-task").post(verify, createTask)
router.route("/delete-task/:id").delete(verify, deleteTask)      
router.route("/update-task/:id").patch(verify, updateTask)
router.route("/get-all-tasks").get(verify, getAllTasks)
router.route("/get-task-by-id/:id").get(verify, getTaskById) 


export default router