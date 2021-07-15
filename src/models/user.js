const log = console.log

const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema( {
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number.')
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not a valid one.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password cant contain password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},
{
    timestamps: true
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function(){
     const user = this
     const token = jwt.sign({_id: user._id.toString() } , process.env.JWT_SECRET) 
     user.tokens = user.tokens.concat({token})
     await user.save()
     return token 
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to log in!')    
    }
    const isMatched = await bcrypt.compare(password, user.password)
    
    if(!isMatched){
         throw new Error('Unable to log in!')
    }
    return user
}

// hash the plain text password before saing 
userSchema.pre('save', async function(next) {
    const user = this

    // check if the password is modified to hash it
    // either if the new user is created or password is updated
    // and this method is for not rehashing a hashed password
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre('remove' , async (next) => {
    const user = this
    await Task.deleteMany({owned: user._id})
    next()
})
const User = mongoose.model('User',userSchema)

module.exports = User