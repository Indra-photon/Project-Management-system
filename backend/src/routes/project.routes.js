import {Router} from 'express'
import { verifyJWT } from '../middlewares/verifyJWT.middlewares.js'
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

router.route("/create-project").post(verifyJWT, createProject)
router.route("/delete-project/:id").delete(verifyJWT, deleteProject)
router.route("/update-project/:id").patch(verifyJWT, updateProject)
router.route("/add-project-member/:id").post(verifyJWT, addProjectMember)
router.route("/delete-project-member/:id").delete(verifyJWT, deleteProjectMember)
router.route("/get-project-by-id/:id").get(verifyJWT, getProjectById)
router.route("/update-member-role/:id").patch(verifyJWT, updateMemberRole)
router.route("/get-all-projects-created-by-a-user").get(verifyJWT, getAllProjectscreatedByaUser)
router.route("/get-all-projects").get(verifyJWT, getAllProjects)    



export default router