import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import { ApiKey } from "../models/apiKey.models.js"
import crypto from 'crypto'

export const verifyAPI = asyncHandler(async (req, res, next) => {
   try {
       const apiKey = req.headers['x-api-key']
       
       if (!apiKey) {
           throw new ApiError(401, "API key is required")
       }
       
       if (!apiKey.startsWith('ak_live_')) {
           throw new ApiError(401, "Invalid API key format")
       }
       
       const hash = crypto.createHash('sha256').update(apiKey).digest('hex')
       
       const apiKeyDoc = await ApiKey.findOne({ 
           keyHash: hash, 
           isActive: true 
       }).populate('user', '-password -refreshToken')
       
       if (!apiKeyDoc) {
           throw new ApiError(401, "Invalid or inactive API key")
       }
       
       if (apiKeyDoc.expiresAt && apiKeyDoc.expiresAt < new Date()) {
           throw new ApiError(401, "API key has expired")
       }
       
       apiKeyDoc.lastUsedAt = new Date()
       await apiKeyDoc.save({ validateBeforeSave: false })
       
       req.user = apiKeyDoc.user
       req.apiKey = apiKeyDoc
       next()
   } catch (error) {
       throw new ApiError(401, error?.message || "Invalid API key")
   }
})