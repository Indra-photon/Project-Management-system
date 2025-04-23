import { ApiError } from "../utils/api-error.js";
import {ApiResponse} from '../utils/api-response.js'
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";

const createProject = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { name, description } = req.body

    try {
        if(!name || !description) {
            throw new ApiError(400, "Please fill all the fields");
        }
    
        if(!userId) {
            throw new ApiError(401, "Unauthorized request! Please login first.");
        }
    
        const existingProject = await Project.findOne({ name })
        if(existingProject) {
            throw new ApiError(400, "Project already exists!");
        }
    
        const project = await Project.create({
            name,
            description,
            createdBy: userId
        })
    
        return res.status(201).json(new ApiResponse(201, project, "Project created successfully!"))
    } catch (error) {
        throw new ApiError(500, "Error creating project!");
    }

})

const deleteProject = asyncHandler(async (req, res) => {
    const {id} = req.params
    const userId = req.user._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }

    if(!id) {
        throw new ApiError(400, "Please provide a project id!");
    }

    const projectMember = await ProjectMember.findOne({ user: userId, project: id })
    if(!projectMember) {
        throw new ApiError(403, "You are not a member of this project!");
    }
    if(projectMember.role !== "admin") {
        throw new ApiError(403, "You are not authorized to delete this project!");
    }
    const projectDelete = await Project.findByIdAndDelete(id)
    if(!projectDelete) {
        throw new ApiError(404, "Project could not be deleted!");
    }
    return res.status(200).json(new ApiResponse(200, projectDelete, "Project deleted successfully!"))   
})

const updateProject = asyncHandler(async (req, res) => {
    const {id} = req.params
    const userId = req.user._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }

    if(!id) {
        throw new ApiError(400, "Please provide a project id!");
    }

    const projectMember = await ProjectMember.findOne({ user: userId, project: id })
    if(!projectMember) {
        throw new ApiError(403, "You are not a member of this project!");
    }
    if(projectMember.role !== "admin") {
        throw new ApiError(403, "You are not authorized to update this project!");
    }

    const { name, description } = req.body  
    if(!name || !description) {
        throw new ApiError(400, "Please fill all the fields");
    }       

    const updatedProject = await Project.findByIdAndUpdate(id, {
        name,
        description
    }, { new: true })
    if(!updatedProject) {
        throw new ApiError(404, "Project could not be updated!");
    }
    return res.status(200).json(new ApiResponse(200, updatedProject, "Project updated successfully!"))
})

const addProjectMember = asyncHandler(async (req, res) => {
    const {id} = req.params
    const userId = req.user._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }

    if(!id) {
        throw new ApiError(400, "Please provide a project id!");
    }

    const projectMember = await ProjectMember.findOne({ user: userId, project: id })
    if(!projectMember) {
        throw new ApiError(403, "You are not a member of this project!");
    }
    if(projectMember.role !== "admin") {
        throw new ApiError(403, "You are not authorized to add members to this project!");
    }
    const { memberId } = req.body
    if(!memberId) {
        throw new ApiError(400, "Please provide a member id!");
    }
    const findprojectMember = await ProjectMember.findOne({ user: memberId, project: id })
    if(findprojectMember) {
        throw new ApiError(400, "This member is already a member of this project!");
    }
    const projectMemberAdd = await ProjectMember.create({
        user: memberId,
        project: id,
    })
    if(!projectMemberAdd) {
        throw new ApiError(404, "Project member could not be added!");
    }
    return res.status(200).json(new ApiResponse(200, projectMemberAdd, "Project member added successfully!"))
})

const deleteProjectMember = asyncHandler(async (req, res) => {
    const {id} = req.params
    const userId = req.user._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }

    if(!id) {
        throw new ApiError(400, "Please provide a project id!");
    }

    const projectMember = await ProjectMember.findOne({ user: userId, project: id })
    if(!projectMember) {
        throw new ApiError(403, "You are not a member of this project!");
    }
    if(projectMember.role !== "admin") {
        throw new ApiError(403, "You are not authorized to delete members from this project!");
    }
    const projectMemberDelete = await ProjectMember.findByIdAndDelete(id) 

    if(!projectMemberDelete) {
        throw new ApiError(404, "Project member could not be deleted!");
    }
    if(projectMemberDelete.user.toString() === userId.toString()) {
        throw new ApiError(403, "You cannot delete yourself from this project!");
    }
    
    return res.status(200).json(new ApiResponse(200, projectMemberDelete, "Project member deleted successfully!"))
})

const getProjectById = asyncHandler(async (req, res) => {
    const {id} = req.params
    const userId = req.user._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }

    if(!id) {
        throw new ApiError(400, "Please provide a project id!");
    }

    const project = await Project.findOne({ project: id })
    if(!project) {
        throw new ApiError(404, "Project not found!");
    }

    return res.status(200).json(new ApiResponse(200, project, "Project found successfully!"))   

})

const getAllProjectscreatedByaUser = asyncHandler(async (req, res) => {
    const userId = req.user._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }

    const projects = await Project.find({ createdBy: userId })
    if(!projects) {
        throw new ApiError(404, "No projects found!");
    }

    return res.status(200).json(new ApiResponse(200, projects, "Projects found successfully!"))         
})

const updateMemberRole = asyncHandler(async (req, res) => {
    const {id} = req.params
    const userId = req.user._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }

    if(!id) {
        throw new ApiError(400, "Please provide a project id!");
    }

    const projectMember = await ProjectMember.findOne({ user: userId, project: id })
    if(!projectMember) {
        throw new ApiError(403, "You are not a member of this project!");
    }
    if(projectMember.role !== "admin") {
        throw new ApiError(403, "You are not authorized to update members in this project!");
    }
    const { memberId, role } = req.body 
    if(!memberId || !role) {
        throw new ApiError(400, "Please provide a member id and role!");
    }
    const findprojectMember = await ProjectMember.findOne({ user: memberId, project: id })
    if(!findprojectMember) {
        throw new ApiError(404, "Requested member is not a member of this project! Please add him first.");
    }

    if(findprojectMember.role === "admin") {
        throw new ApiError(403, "You cannot update the role of an admin member!");
    }
    if(findprojectMember.role === role) {
        throw new ApiError(400, "This member already has this role!");
    }
    const updatedProjectMember = await ProjectMember.findByIdAndUpdate(findprojectMember._id, { role }, { new: true })
    if(!updatedProjectMember) {
        throw new ApiError(404, "Project member could not be updated!");
    }

    return res.status(200).json(new ApiResponse(200, updatedProjectMember, "Project member updated successfully!")) 

})

const getAllProjects = asyncHandler(async (req, res) => {
    const userId = req.user._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized request! Please login first.");
    }

    const projects = await Project.find({})
    if(!projects) {
        throw new ApiError(404, "No projects found!");
    }

    return res.status(200).json(new ApiResponse(200, projects, "Projects found successfully!"))             
})



export {
    createProject,
    deleteProject,
    updateProject,
    addProjectMember,
    deleteProjectMember,
    getProjectById,
    updateMemberRole,
    getAllProjectscreatedByaUser,
    getAllProjects
}

