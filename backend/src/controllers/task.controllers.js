import { ApiError } from "../utils/api-error.js";
import {ApiResponse} from '../utils/api-response.js'
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import {User} from "../models/user.models.js";
import { Task } from "../models/task.models.js";
import { TaskStatusEnum } from "../utils/constants.js";

const createTask = asyncHandler(async (req, res) => {
    const {title, description, projectId, assignedTo, status = TaskStatusEnum.TODO} = req.body
    const userId = req.user._id
    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }
    if(!title || !description || !projectId || !assignedTo) {
        throw new ApiError(400, "Please fill all the fields!");
    }
    const project = await Project.findById(projectId)
    if(!project) {
        throw new ApiError(404, "Project not found!");
    }
    const projectMember = await ProjectMember.findOne({ user: userId, project: projectId })
    if(!projectMember) {
        throw new ApiError(403, "You are not a member of this project!");
    }
    if(projectMember.role !== "admin") {
        throw new ApiError(403, "You are not authorized to create a task in this project!");
    }
    const assignedUser = await User.findById(assignedTo)
    if(!assignedUser) {
        throw new ApiError(404, "Assigned user not found!");
    }
    const isassignedUserInProject = await ProjectMember.findOne({ user: assignedTo, project: projectId })
    if(!isassignedUserInProject) {
        throw new ApiError(403, "Assigned user is not a member of this project!");
    }
    
    const task = await Task.create({
        title,
        description,
        project: projectId,
        assignedTo,
        assignedBy: userId,
        status
    })
    if(!task) {
        throw new ApiError(500, "Error creating task!");
    }
    return res.status(201).json(new ApiResponse(201, task, "Task created successfully!"))
})

const deleteTask = asyncHandler(async (req, res) => {
    const {id} = req.params
    const userId = req.user._id
    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }
    if(!id) {
        throw new ApiError(400, "Please provide a task id!");
    }
    const task = await Task.findById(id)
    if(!task) {
        throw new ApiError(404, "Task not found!");
    }
    const projectMember = await ProjectMember.findOne({ user: userId, project: task.project })
    if(!projectMember) {
        throw new ApiError(403, "You are not a member of this project!");
    }
    if(projectMember.role !== "admin") {
        throw new ApiError(403, "You are not authorized to delete this task!");
    }
    const taskDelete = await Task.findByIdAndDelete(id)
    if(!taskDelete) {
        throw new ApiError(404, "Task could not be deleted!");
    }
    
    return res.status(200).json(new ApiResponse(200, taskDelete, "Task deleted successfully!"))
})

const updateTask = asyncHandler(async (req, res) => {
    const {id} = req.params
    const userId = req.user._id
    const {title, description, projectId, assignedTo, status} = req.body
    if(!title && !description && !projectId && !assignedTo && !status) {
        throw new ApiError(400, "Please provide at least one field to update!");
    }
    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }
    if(!id) {
        throw new ApiError(400, "Please provide a task id!");
    }
    const task = await Task.findById(id)
    if(!task) {
        throw new ApiError(404, "Task not found!");
    }
    const projectMember = await ProjectMember.findOne({ user: userId, project: task.project })
    if(!projectMember) {
        throw new ApiError(403, "You are not a member of this project!");
    }
    if(projectMember.role !== "admin") {
        throw new ApiError(403, "You are not authorized to update this task!");
    }
    
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {new: true})
    if(!updatedTask) {
        throw new ApiError(500, "Error updating task!");
    }
    
    return res.status(200).json(new ApiResponse(200, updatedTask, "Task updated successfully!"))
})

const getAllTasks = asyncHandler(async (req, res) => {
    const userId = req.user._id
    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }
    const tasks = await Task.find({}).populate("assignedTo").populate("assignedBy").populate("project")
    if(!tasks) {
        throw new ApiError(404, "No tasks found!");
    }
    return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully!")) 
})

const getTaskById = asyncHandler(async (req, res) => {
    const {id} = req.params
    const userId = req.user._id
    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }
    if(!id) {
        throw new ApiError(400, "Please provide a task id!");
    }
    const task = await Task.findById(id).populate("assignedTo").populate("assignedBy").populate("project")
    if(!task) {
        throw new ApiError(404, "Task not found!");
    }
    return res.status(200).json(new ApiResponse(200, task, "Task fetched successfully!"))   
})



export {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
}