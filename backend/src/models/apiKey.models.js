import mongoose, {Schema} from 'mongoose'
import crypto from 'crypto'

const apiKeySchema = new Schema({
   user: {
       type: Schema.Types.ObjectId,
       ref: "User",
       required: true
   },
   keyHash: {
       type: String,
       required: true,
       unique: true
   },
   name: {
       type: String,
       required: true,
       trim: true
   },
   prefix: {
       type: String,
       required: true
   },
   isActive: {
       type: Boolean,
       default: true
   },
   lastUsedAt: {
       type: Date
   },
   expiresAt: {
       type: Date
   }
}, {timestamps: true})

apiKeySchema.methods.generateApiKey = function() {
   const prefix = 'ak_live_'
   const randomBytes = crypto.randomBytes(32).toString('hex')
   const apiKey = prefix + randomBytes
   const hash = crypto.createHash('sha256').update(apiKey).digest('hex')
   
   this.keyHash = hash
   this.prefix = prefix
   
   return apiKey
}

export const ApiKey = mongoose.model("ApiKey", apiKeySchema)