import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import connectDB from '../config/db.js';

dotenv.config();




async function deleteUser(email) {
    try {
        await connectDB();
        const result = await User.deleteOne({ email });
        if (result.deletedCount === 0) {
            console.log('No user found with that email.');
        } else {
            console.log('User deleted.');
        }
        process.exit();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

deleteUser(process.env.ADMIN_EMAIL);
