import {Router} from 'express'
import { verify } from '../middlewares/verify.middlewares.js'
import { createProject,
    deleteProject,
    updateProject,
    addProjectMember,
    deleteProjectMember,
    getProjectById,
    updateMemberRole,
    getAllProjectscreatedByaUser,
    getAllProjects } from '../controllers/project.controllers.js'

const router = Router()

router.route("/create-project").post(verify, createProject)
router.route("/delete-project/:id").delete(verify, deleteProject)
router.route("/update-project/:id").patch(verify, updateProject)
router.route("/add-project-member/:id").post(verify, addProjectMember)
router.route("/delete-project-member/:id").delete(verify, deleteProjectMember)
router.route("/get-project-by-id/:id").get(verify, getProjectById)
router.route("/update-member-role/:id").patch(verify, updateMemberRole)
router.route("/get-all-projects-created-by-a-user").get(verify, getAllProjectscreatedByaUser)
router.route("/get-all-projects").get(verify, getAllProjects)    



export default router