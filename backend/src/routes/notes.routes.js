import {Router} from 'express'
import { verifyJWT } from '../middlewares/verifyJWT.middlewares.js'
import { createNote,
    updateNote,
    deleteNote,
    getNotes,
    getNotebyId } from '../controllers/note.controllers.js'

const router = Router()

router.route("/create-note").post(verifyJWT, createNote)
router.route("/update-note/:noteId").patch(verifyJWT, updateNote)   
router.route("/delete-note/:noteId").delete(verifyJWT, deleteNote)
router.route("/get-notes/:projectId").get(verifyJWT, getNotes)  
router.route("/get-note-by-id/:noteId").get(verifyJWT, getNotebyId)


export default router