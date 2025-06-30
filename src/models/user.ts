import mongoose, { Document, Model } from "mongoose"
import { Task } from "./task.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    tokens: { token: string }[];
    generateWebToken(): Promise<string>;
}

interface IUserModel extends Model<IUser> {
    findByCredentials(email: string, password: string): Promise<IUser>;
}

// Schema for user
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value: string) {
                if(!validator.isEmail(value)) {
                    throw new Error('E-mail is invaild.')
                }
            }
        },
        password: {
            type: String,
            required: true,
            validate(value: string) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Password can\'t be password.');
                }
            },
            minlength: 7,
            trim: true
        },
    tokens: [{
        token: {
            required: true,
            type: String
        }
    }]
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Web token generator method
userSchema.methods.generateWebToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'mySecretKey');

    user.tokens = user.tokens.concat({ token });
    await user.save()

    return token;
}

// Produces public data sent to user
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

// Find user by email and password
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login!');
    }

    const isCorrect = await bcrypt.compare(password, user.password);

    if (!isCorrect) {
        throw new Error('Unable to login!');
    }

    return user;
}

// Hash password
userSchema.pre('save', async function(next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

// Delete task before user is deleted
userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });

    next();
});

const User = mongoose.model<IUser, IUserModel>('User', userSchema)

export default User
