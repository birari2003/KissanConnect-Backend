const { User, FarmerProfile, MessageRecipient, AdminMessage, sequelize } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const addUser = async (req, res) => {
    try {
        const { name, phone, email, password, role, preferred_language } = req.body;

        // Basic validation
        if (!name || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, phone, and password are required.',
            });
        }

        // Check if user already exists (optional, as Sequelize unique constraint will handle it, but good for custom error message)
        const existingUser = await User.findOne({ where: { phone } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this phone number already exists.',
            });
        }

        const languageMap = {
            'en': 'english',
            'mr': 'marathi',
            'hi': 'hindi'
        };
        const lang = languageMap[preferred_language] || 'english';

        const newUser = await User.create({
            name,
            phone,
            email,
            password,
            role: role || 'farmer', // Default to farmer if not provided
            language_preference: lang,
        });

        // Remove password from response
        const userResponse = newUser.toJSON();
        delete userResponse.password;

        return res.status(201).json({
            success: true,
            message: 'User created successfully.',
            data: userResponse,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Phone and password are required.',
            });
        }

        // Find user by phone and include farmer profile
        const user = await User.findOne({
            where: { phone },
            include: [{
                model: FarmerProfile,
                as: 'farmerProfile',
                attributes: ['request_status', 'rejection_reason'],
                required: false
            }]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password.',
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role, phone: user.phone },
            process.env.JWT_SECRET || 'your_jwt_secret_key', // Use env var in production
            { expiresIn: '7d' }
        );

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        // Add farmer profile status to response if exists
        if (userResponse.farmerProfile) {
            userResponse.farmer_status = userResponse.farmerProfile.request_status;
            userResponse.rejection_reason = userResponse.farmerProfile.rejection_reason;
            delete userResponse.farmerProfile; // Remove the nested object
        } else {
            userResponse.farmer_status = null;
            userResponse.rejection_reason = null;
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            data: userResponse,
        });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};



const registerFarmer = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from auth middleware
        const {
            // FarmerProfile fields
            age, gender, aadhar_no, dob, address,
            state_id, district_id, taluka_id, village_id,
            land_area, soil_type, source_of_irrigation,
            crops_grown, cultivation_type, crop_description,
            occupation, additional_work_type, crop_owned,
            property_information, training_type, feedback
        } = req.body;

        // Check if profile already exists
        const existingProfile = await FarmerProfile.findOne({ where: { user_id: userId } });
        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: 'Farmer profile already exists for this user.',
            });
        }

        // Create FarmerProfile
        const newProfile = await FarmerProfile.create({
            user_id: userId,
            age,
            gender,
            mobile_no: req.user.phone, // Use phone from token/user
            aadhar_no,
            dob,
            address,
            state_id,
            district_id,
            taluka_id,
            village_id,
            land_area,
            soil_type,
            source_of_irrigation,
            crops_grown,
            cultivation_type,
            crop_description,
            occupation,
            additional_work_type,
            crop_owned,
            property_information,
            training_type,
            feedback,
            request_status: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: 'Farmer profile created successfully.',
            data: newProfile,
        });

    } catch (error) {
        console.error('Error registering farmer profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

const getRequestStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await FarmerProfile.findOne({
            where: { user_id: userId },
            attributes: ['request_status', 'rejection_reason']
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found.',
                status: 'not_registered'
            });
        }

        return res.status(200).json({
            success: true,
            status: profile.request_status,
            rejection_reason: profile.rejection_reason
        });
    } catch (error) {
        console.error('Error fetching request status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all message recipients for this user
        const messageRecipients = await MessageRecipient.findAll({
            where: { super_admin_id: userId },
            attributes: ['id', 'message_id', 'super_admin_id', 'is_read', 'read_at', 'created_at', 'updated_at'],
            include: [
                {
                    model: AdminMessage,
                    as: 'message',
                    attributes: ['id', 'admin_id', 'message', 'created_at', 'updated_at'],
                    include: [
                        {
                            model: User,
                            as: 'admin',
                            attributes: ['id', 'name', 'phone', 'email']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: messageRecipients,
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

module.exports = {
    addUser,
    loginUser,
    registerFarmer,
    getRequestStatus,
    getMessages,
};
