import { ApiError } from "../utils/api-error.js";
import {ApiResponse} from '../utils/api-response.js'
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Note } from "../models/note.models.js";
import { User } from "../models/user.models.js";

const createNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }
    if (!content) {
        throw new ApiError(400, "Please provide content for the note!");    
    }
    if (!projectId) {
        throw new ApiError(400, "Please provide a project id!");
    }
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found!");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found!");
    }
    if(userId.toString() !== project.createdBy.toString()) {
        const projectMember = await ProjectMember.findOne({ user: userId, project: projectId });
        if (!projectMember) {
            throw new ApiError(403, "You are not a member of this project!");
        }
    }
    const existingNote = await Note.findOne({ project: projectId, createdBy: userId, content });
    if (existingNote) {
        throw new ApiError(400, "Note already exists!");
    }
    const note = await Note.create({
        project: projectId,
        createdBy: userId,
        content
    });
    if (!note) {
        throw new ApiError(500, "Error creating note!");
    }
    return res.status(201).json(new ApiResponse(201, note, "Note created successfully!"));
})

const updateNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }
    if (!content) {
        throw new ApiError(400, "Please provide content for the note!");    
    }
    if (!noteId) {
        throw new ApiError(400, "Please provide a note id!");
    }
    const note = await Note.findById(noteId);
    if (!note) {
        throw new ApiError(404, "Note not found!");
    }
    if(userId.toString() !== note.createdBy.toString()) {
        throw new ApiError(403, "You are not authorized to update this note!");
    }
    const updatedNote = await Note.findByIdAndUpdate(noteId, { content }, { new: true });
    if (!updatedNote) {
        throw new ApiError(500, "Error updating note!");
    }
    return res.status(200).json(new ApiResponse(200, updatedNote, "Note updated successfully!"));
})

const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }
    if (!noteId) {
        throw new ApiError(400, "Please provide a note id!");
    }
    const note = await Note.findById(noteId);
    if (!note) {
        throw new ApiError(404, "Note not found!");
    }
    if(userId.toString() !== note.createdBy.toString()) {
        throw new ApiError(403, "You are not authorized to delete this note!");
    }
    const deletedNote = await Note.findByIdAndDelete(noteId);
    if (!deletedNote) {
        throw new ApiError(500, "Error deleting note!");
    }
    return res.status(200).json(new ApiResponse(200, deletedNote, "Note deleted successfully!"));
})

const getNotes = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }
    if (!projectId) {
        throw new ApiError(400, "Please provide a project id!");
    }
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found!");
    }
    const notes = await Note.find({ project: projectId }).populate("createdBy", "name email");
    return res.status(200).json(new ApiResponse(200, notes, "Notes retrieved successfully!"));
})

const getNotebyId = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }
    if (!noteId) {
        throw new ApiError(400, "Please provide a note id!");
    }
    const note = await Note.findById(noteId).populate("createdBy", "name email");
    if (!note) {
        throw new ApiError(404, "Note not found!");
    }
    return res.status(200).json(new ApiResponse(200, note, "Note retrieved successfully!"));    
})


export {
    createNote,
    updateNote,
    deleteNote,
    getNotes,
    getNotebyId
}