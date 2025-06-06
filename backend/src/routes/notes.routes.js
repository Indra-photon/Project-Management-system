import {Router} from 'express'
import { verify } from '../middlewares/verify.middlewares.js'
import { createNote,
    updateNote,
    deleteNote,
    getNotes,
    getNotebyId } from '../controllers/note.controllers.js'

const router = Router()

router.route("/create-note").post(verify, createNote)
router.route("/update-note/:noteId").patch(verify, updateNote)   
router.route("/delete-note/:noteId").delete(verify, deleteNote)
router.route("/get-notes/:projectId").get(verify, getNotes)  
router.route("/get-note-by-id/:noteId").get(verify, getNotebyId)


export default router