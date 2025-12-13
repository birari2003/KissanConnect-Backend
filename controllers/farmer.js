const { User, FarmerProfile, MessageRecipient, AdminMessage, JobProfile, CropSell, CropClaim, GovernmentScheme, Media, State, District, Taluka, Village, sequelize } = require('../models');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { getContactEmailTemplate, getContactEmailPlainText } = require('../utils/templates');



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
        console.log("userResponse", userResponse);
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
        let {
            // FarmerProfile fields (DB names)
            age, gender, aadhar_no, dob, address,
            state_id, district_id, taluka_id, village_id,
            land_area, soil_type, source_of_irrigation,
            crops_grown, cultivation_type, crop_description,
            occupation, additional_work_type, crop_owned,
            property_information, training_type, feedback,

            // Incoming fields (User provided names)
            aadhar_number, state, district, city, village,
            irrigation_sources, crops, work_type, cattle, poultry_info,
            passport_photo: passport_photo_base64,
            passport_photo_name // Extract optional filename
        } = req.body;

        // Map gender values from Marathi/Hindi to English
        const genderMap = {
            // English
            'male': 'male',
            'female': 'female',
            'other': 'other',
            // Marathi
            'पुरुष': 'male',
            'स्त्री': 'female',
            'इतर': 'other',
            // Hindi
            'पुरुष': 'male',
            'महिला': 'female',
            'अन्य': 'other'
        };

        // Normalize gender value
        if (gender) {
            gender = genderMap[gender.toLowerCase()] || genderMap[gender] || gender;
        }

        // Sanitize log
        const bodyLog = { ...req.body };
        if (bodyLog.passport_photo) bodyLog.passport_photo = 'Base64 String (Truncated)';
        console.log('Incoming body:', bodyLog);

        // --- 1. Field Mapping ---
        if (aadhar_number) aadhar_no = aadhar_number;
        if (work_type) additional_work_type = work_type;

        // Handle arrays -> string conversions
        if (Array.isArray(irrigation_sources)) source_of_irrigation = irrigation_sources.join(', ');
        else if (irrigation_sources) source_of_irrigation = irrigation_sources;

        if (Array.isArray(crops)) crops_grown = crops.join(', ');
        else if (crops) crops_grown = crops;

        if (Array.isArray(cattle)) crop_owned = cattle.join(', '); // Mapping cattle to crop_owned as per user context
        else if (cattle) crop_owned = cattle;

        if (poultry_info) property_information = poultry_info; // Mapping poultry_info to property_information

        // --- 2. Location Lookup (Name -> ID) ---
        if (!state_id && state) {
            const stateObj = await State.findOne({ where: { name: state } });
            if (stateObj) state_id = stateObj.id;
        }
        if (!district_id && district) {
            const districtObj = await District.findOne({ where: { name: district } });
            if (districtObj) district_id = districtObj.id;
        }
        // Assuming 'city' maps to 'taluka' or 'city'
        if (!taluka_id && city) {
            const talukaObj = await Taluka.findOne({ where: { name: city } });
            if (talukaObj) taluka_id = talukaObj.id;
        }
        if (!village_id && village) {
            const villageObj = await Village.findOne({ where: { name: village } });
            if (villageObj) village_id = villageObj.id;
        }

        // --- 3. Image Handling (File vs Base64) ---
        let passport_photo_filename = null;

        console.log('Image Debug:', {
            hasReqFile: !!req.file,
            base64Length: passport_photo_base64 ? passport_photo_base64.length : 0,
            base64Type: typeof passport_photo_base64,
            providedName: passport_photo_name
        });

        if (req.file) {
            // Case A: Multipart file upload
            passport_photo_filename = req.file.filename;
        } else if (passport_photo_base64 && typeof passport_photo_base64 === 'string' && passport_photo_base64.length > 100) {
            // Case B: Base64 string in body
            console.log('Processing base64 image...');
            try {
                // Remove header if present (e.g., "data:image/jpeg;base64,")
                const base64Data = passport_photo_base64.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');

                // Determine filename: Use provided name or generate one
                let filename;
                if (passport_photo_name) {
                    // Sanitize provided filename
                    const safeName = path.parse(passport_photo_name).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const ext = path.extname(passport_photo_name) || '.jpg';
                    filename = `${safeName}-${Date.now()}${ext}`;
                } else {
                    filename = `passport-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
                }

                const uploadPath = path.join(__dirname, '../uploads', filename);

                // Ensure uploads directory exists
                if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
                    fs.mkdirSync(path.join(__dirname, '../uploads'));
                }

                fs.writeFileSync(uploadPath, buffer);
                passport_photo_filename = filename;
                console.log('Saved base64 image as:', filename);
            } catch (err) {
                console.error('Error saving base64 image:', err);
                // Continue without image or return error? Let's continue with warning
            }
        } else {
            console.log('No valid image found to process.');
        }

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
            passport_photo: passport_photo_filename,
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

const sendEmail = async (req, res) => {
    try {
        const { subject, message, senderEmail } = req.body;

        // Validate required fields
        if (!subject || !message || !senderEmail) {
            return res.status(400).json({
                success: false,
                message: 'Subject, message, and sender email are required.',
            });
        }

        // Convert senderEmail to array if it's a single email
        const senderEmails = Array.isArray(senderEmail) ? senderEmail : [senderEmail];

        // Validate that we have at least one email
        if (senderEmails.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one sender email is required.',
            });
        }

        // Validate email format for all emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = senderEmails.filter(email => !emailRegex.test(email));

        if (invalidEmails.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format found.',
                invalidEmails: invalidEmails,
            });
        }

        // Create transporter using SMTP credentials from environment variables
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_APP_PASSWORD,
            },
        });

        // Send email for each sender
        const emailResults = [];
        const errors = [];

        for (const email of senderEmails) {
            try {
                const mailOptions = {
                    from: `"${email}" <${process.env.SMTP_EMAIL}>`, // Sender address (using SMTP email but showing sender's email in name)
                    to: process.env.SMTP_EMAIL, // Your email where you want to receive messages
                    replyTo: email, // Reply to the sender's email
                    subject: subject,
                    html: getContactEmailTemplate(email, subject, message),
                    text: getContactEmailPlainText(email, subject, message),
                };
                const info = await transporter.sendMail(mailOptions);

                emailResults.push({
                    email: email,
                    success: true,
                    messageId: info.messageId,
                });
            } catch (emailError) {
                console.error(`Error sending email to ${email}:`, emailError);
                errors.push({
                    email: email,
                    error: emailError.message,
                });
            }
        }

        // Determine response based on results
        const allSuccessful = errors.length === 0;
        const allFailed = emailResults.length === 0;

        if (allSuccessful) {
            return res.status(200).json({
                success: true,
                message: `Email${senderEmails.length > 1 ? 's' : ''} sent successfully.`,
                totalSent: emailResults.length,
                results: emailResults,
            });
        } else if (allFailed) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send all emails.',
                errors: errors,
            });
        } else {
            return res.status(207).json({ // 207 Multi-Status
                success: true,
                message: 'Some emails sent successfully, some failed.',
                totalSent: emailResults.length,
                totalFailed: errors.length,
                results: emailResults,
                errors: errors,
            });
        }

    } catch (error) {
        console.error('Error in sendEmail:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send email.',
            error: error.message,
        });
    }
};


const getJobs = async (req, res) => {
    try {
        const { job_type, location, state_id, district_id } = req.query;
        const whereClause = {
            status: 'active',
            [sequelize.Sequelize.Op.or]: [
                { expires_at: null },
                { expires_at: { [sequelize.Sequelize.Op.gte]: new Date() } }
            ]
        };

        if (job_type) whereClause.job_type = job_type;
        // Simple location search (can be enhanced)
        if (location) whereClause.location = { [sequelize.Sequelize.Op.like]: `%${location}%` };
        if (state_id) whereClause.state_id = state_id;
        if (district_id) whereClause.district_id = district_id;

        const jobs = await JobProfile.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: jobs
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const getJobById = async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await JobProfile.findOne({
            where: {
                id: jobId,
                status: 'active'
            },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['name', 'email']
                }
            ]
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or not active.'
            });
        }

        return res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        console.error('Error fetching job details:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};



const addCrop = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { crop_name, quantity, unit, price_per_unit } = req.body;
        const userId = req.user.id;
        const files = req.files; // Array of files

        if (!crop_name || !quantity || !unit || !price_per_unit) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Crop name, quantity, unit, and price per unit are required.'
            });
        }

        const cropSell = await CropSell.create({
            user_id: userId,
            crop_name,
            quantity,
            unit,
            price_per_unit
        }, { transaction: t });

        if (files && files.length > 0) {
            const mediaData = files.map(file => ({
                file_name: file.originalname,
                file_path: file.filename,
                file_size: file.size,
                mime_type: file.mimetype,
                media_type: 'image', // Assuming only images for now
                uploaded_by: userId,
                entity_type: 'crop_sell',
                entity_id: cropSell.id
            }));

            await Media.bulkCreate(mediaData, { transaction: t });
        }

        await t.commit();

        return res.status(201).json({
            success: true,
            message: 'Crop added for sale successfully.',
            data: cropSell
        });
    } catch (error) {
        await t.rollback();
        console.error('Error adding crop:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const getCrops = async (req, res) => {
    try {
        const userId = req.user.id;
        const crops = await CropSell.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: User,
                    as: 'seller',
                    attributes: ['id', 'name', 'phone', 'email']
                },
                {
                    model: Media,
                    as: 'photos',
                    attributes: ['id', 'file_path', 'media_type']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: crops
        });
    } catch (error) {
        console.error('Error fetching crops:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const addCropClaim = async (req, res) => {
    try {
        const { crop_name, claim_details } = req.body;
        const userId = req.user.id;
        const evidence = req.file ? req.file.filename : null;

        if (!crop_name || !claim_details) {
            return res.status(400).json({
                success: false,
                message: 'Crop name and claim details are required.'
            });
        }

        const claim = await CropClaim.create({
            user_id: userId,
            crop_name,
            claim_details,
            evidence,
            status: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: 'Crop claim submitted successfully.',
            data: claim
        });
    } catch (error) {
        console.error('Error adding crop claim:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const getClaims = async (req, res) => {
    try {
        const userId = req.user.id;
        const claims = await CropClaim.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: claims
        });
    } catch (error) {
        console.error('Error fetching claims:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const getAllCrops = async (req, res) => {
    try {
        const crops = await CropSell.findAll({
            include: [
                {
                    model: User,
                    as: 'seller',
                    attributes: ['id', 'name', 'phone', 'email']
                },
                {
                    model: Media,
                    as: 'photos',
                    attributes: ['id', 'file_path', 'media_type']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: crops
        });
    } catch (error) {
        console.error('Error fetching all crops:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const getGovernmentSchemes = async (req, res) => {
    try {
        const schemes = await GovernmentScheme.findAll({
            where: { status: 'published' },
            order: [['published_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: schemes
        });
    } catch (error) {
        console.error('Error fetching government schemes:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const addFarmerHistory = async (req, res) => {
    try {
        const viewerUserId = req.user.id; // Logged-in user from auth middleware
        const {
            crop_sell_id,
            crop_owner_user_id,
            crop_name,
            crop_image_path
        } = req.body;

        // Validate required fields
        if (!crop_sell_id || !crop_owner_user_id) {
            return res.status(400).json({
                success: false,
                message: 'Crop sell ID and crop owner user ID are required.'
            });
        }

        // Fetch viewer (logged-in farmer) details
        const viewer = await User.findByPk(viewerUserId, {
            attributes: ['id', 'name', 'phone']
        });

        if (!viewer) {
            return res.status(404).json({
                success: false,
                message: 'Viewer user not found.'
            });
        }

        // Fetch crop owner details
        const cropOwner = await User.findByPk(crop_owner_user_id, {
            attributes: ['id', 'name', 'phone']
        });

        if (!cropOwner) {
            return res.status(404).json({
                success: false,
                message: 'Crop owner user not found.'
            });
        }

        // Fetch crop details if not provided
        let finalCropName = crop_name;
        let finalCropImagePath = crop_image_path;

        // If crop_image_path is provided as a URL, extract just the filename
        if (finalCropImagePath && (finalCropImagePath.includes('/') || finalCropImagePath.includes('\\'))) {
            // Extract filename from path or URL
            finalCropImagePath = finalCropImagePath.split('/').pop().split('\\').pop();
        }

        if (!finalCropName || !finalCropImagePath) {
            const cropSell = await CropSell.findByPk(crop_sell_id, {
                include: [{
                    model: Media,
                    as: 'photos',
                    attributes: ['file_path'],
                    limit: 1
                }]
            });

            if (cropSell) {
                finalCropName = finalCropName || cropSell.crop_name;
                if (!finalCropImagePath && cropSell.photos && cropSell.photos.length > 0) {
                    // file_path should already be just the filename
                    finalCropImagePath = cropSell.photos[0].file_path;
                }
            }
        }

        // Import FarmerHistory model
        const { FarmerHistory } = require('../models');

        // Create history record
        const history = await FarmerHistory.create({
            viewer_user_id: viewer.id,
            viewer_name: viewer.name,
            viewer_contact: viewer.phone,
            crop_owner_user_id: cropOwner.id,
            crop_owner_name: cropOwner.name,
            crop_owner_contact: cropOwner.phone,
            crop_sell_id: crop_sell_id,
            crop_name: finalCropName,
            crop_image_path: finalCropImagePath,
            viewed_at: new Date()
        });

        return res.status(201).json({
            success: true,
            message: 'Farmer history recorded successfully.',
            data: history
        });

    } catch (error) {
        console.error('Error adding farmer history:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const addComplaint = async (req, res) => {
    try {
        const complainantUserId = req.user.id; // Logged-in user from auth middleware
        const {
            against_user_id,
            complaint_text
        } = req.body;

        // Validate required fields
        if (!against_user_id || !complaint_text) {
            return res.status(400).json({
                success: false,
                message: 'Against user ID and complaint text are required.'
            });
        }

        // Validate complaint text length
        if (complaint_text.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Complaint text must be at least 10 characters long.'
            });
        }

        // Prevent self-complaints
        if (complainantUserId === parseInt(against_user_id)) {
            return res.status(400).json({
                success: false,
                message: 'You cannot file a complaint against yourself.'
            });
        }

        // Fetch complainant (logged-in farmer) details
        const complainant = await User.findByPk(complainantUserId, {
            attributes: ['id', 'name', 'phone']
        });

        if (!complainant) {
            return res.status(404).json({
                success: false,
                message: 'Complainant user not found.'
            });
        }

        // Fetch accused farmer details
        const accused = await User.findByPk(against_user_id, {
            attributes: ['id', 'name', 'phone']
        });

        if (!accused) {
            return res.status(404).json({
                success: false,
                message: 'Accused user not found.'
            });
        }

        // Import Complaint model
        const { Complaint } = require('../models');

        // Create complaint record
        const complaint = await Complaint.create({
            complainant_user_id: complainant.id,
            complainant_name: complainant.name,
            complainant_contact: complainant.phone,
            against_user_id: accused.id,
            against_name: accused.name,
            against_contact: accused.phone,
            complaint_text: complaint_text.trim(),
            status: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: 'Complaint filed successfully.',
            data: complaint
        });

    } catch (error) {
        console.error('Error adding complaint:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const getFarmerHistory = async (req, res) => {
    try {
        const { FarmerHistory } = require('../models');

        // Fetch all history records with associations
        const history = await FarmerHistory.findAll({
            include: [
                {
                    model: User,
                    as: 'viewer',
                    attributes: ['id', 'name', 'phone', 'email']
                },
                {
                    model: User,
                    as: 'cropOwner',
                    attributes: ['id', 'name', 'phone', 'email']
                },
                {
                    model: CropSell,
                    as: 'crop',
                    attributes: ['id', 'crop_name', 'quantity', 'unit', 'price_per_unit'],
                    include: [{
                        model: Media,
                        as: 'photos',
                        attributes: ['id', 'file_path', 'media_type']
                    }]
                }
            ],
            order: [['viewed_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching farmer history:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const getComplaints = async (req, res) => {
    try {
        const { Complaint } = require('../models');

        // Fetch all complaints with associations
        const complaints = await Complaint.findAll({
            include: [
                {
                    model: User,
                    as: 'complainant',
                    attributes: ['id', 'name', 'phone', 'email']
                },
                {
                    model: User,
                    as: 'accused',
                    attributes: ['id', 'name', 'phone', 'email']
                },
                {
                    model: User,
                    as: 'resolver',
                    attributes: ['id', 'name', 'email'],
                    required: false // Left join since resolver can be null
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: complaints
        });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const getFarmerProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch User details
        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'phone', 'email', 'language_preference', 'role']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Fetch Farmer Profile with location details
        const farmerProfile = await FarmerProfile.findOne({
            where: { user_id: userId },
            include: [
                { model: State, as: 'state', attributes: ['id', 'name'], required: false },
                { model: District, as: 'district', attributes: ['id', 'name'], required: false },
                { model: Taluka, as: 'taluka', attributes: ['id', 'name'], required: false },
                { model: Village, as: 'village', attributes: ['id', 'name'], required: false }
            ]
        });

        const responseData = {
            user: user,
            farmer_profile: farmerProfile || null
        };

        return res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Error fetching farmer profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

module.exports = {
    addUser,
    loginUser,
    registerFarmer,
    getFarmerProfile,
    getRequestStatus,
    getMessages,
    sendEmail,
    getJobs,
    getJobById,
    addCrop,
    getCrops,
    addCropClaim,
    getClaims,
    getAllCrops,
    getGovernmentSchemes,
    addFarmerHistory,
    getFarmerHistory,
    addComplaint,
    getComplaints
};
