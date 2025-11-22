const { User, FarmerProfile, AdminMessage, MessageRecipient, State, District, Taluka, Village, sequelize } = require('../models');



const getFarmersList = async (req, res) => {
    try {
        const { state_id, district_id, taluka_id, village_id } = req.query;

        const whereClause = {};
        if (state_id) whereClause.state_id = state_id;
        if (district_id) whereClause.district_id = district_id;
        if (taluka_id) whereClause.taluka_id = taluka_id;
        if (village_id) whereClause.village_id = village_id;

        const farmers = await FarmerProfile.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'phone', 'email'],
                },
            ],
            attributes: ['id', 'request_status', 'state_id', 'district_id', 'taluka_id', 'village_id'],
        });

        return res.status(200).json({
            success: true,
            data: farmers,
        });
    } catch (error) {
        console.error('Error fetching farmers list:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

const updateFarmerStatus = async (req, res) => {
    try {
        const { user_id, status, rejection_reason } = req.body;
        const adminId = req.user.id;

        if (!user_id || !status) {
            return res.status(400).json({
                success: false,
                message: 'User ID and status are required.',
            });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be approved or rejected.',
            });
        }

        const profile = await FarmerProfile.findOne({ where: { user_id } });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Farmer profile not found.',
            });
        }

        profile.request_status = status;

        if (status === 'approved') {
            profile.approved_by = adminId;
            profile.approved_at = new Date();
            profile.rejected_at = null;
            profile.rejection_reason = null;
        } else if (status === 'rejected') {
            profile.rejected_at = new Date();
            profile.rejection_reason = rejection_reason || 'No reason provided';
            profile.approved_by = null;
            profile.approved_at = null;
        }

        await profile.save();

        return res.status(200).json({
            success: true,
            message: `Farmer profile ${status} successfully.`,
            data: profile,
        });

    } catch (error) {
        console.error('Error updating farmer status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

const assignSuperAdmin = async (req, res) => {
    try {
        const { user_id, level, state_id, district_id, taluka_id, village_id } = req.body;

        if (!user_id || !level) {
            return res.status(400).json({
                success: false,
                message: 'User ID and level are required.',
            });
        }

        const validLevels = ['state', 'district', 'city', 'village'];
        if (!validLevels.includes(level)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid level. Must be state, district, city, or village.',
            });
        }

        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        user.role = 'super_admin';
        user.super_admin_level = level;

        // Reset all location IDs first
        user.super_admin_state_id = null;
        user.super_admin_district_id = null;
        user.super_admin_taluka_id = null;
        user.super_admin_village_id = null;

        // Set the appropriate location ID based on level
        if (level === 'state') {
            if (!state_id) return res.status(400).json({ success: false, message: 'State ID is required for state level.' });
            user.super_admin_state_id = state_id;
        } else if (level === 'district') {
            if (!district_id) return res.status(400).json({ success: false, message: 'District ID is required for district level.' });
            user.super_admin_district_id = district_id;
        } else if (level === 'city') { // Assuming 'city' maps to taluka for now based on schema, or if city is separate. Schema has taluka.
            // The user request mentioned 'city', but schema has 'taluka'. I'll map city to taluka if that's the intent, or check if city exists.
            // Schema has `super_admin_taluka_id`. User request said `super_admin_level` ENUM('state', 'district', 'city', 'village').
            // But schema in `05-create-user.js` has `super_admin_taluka_id`.
            // It's possible 'city' is the enum value but it maps to taluka_id, OR there is a missing city_id.
            // However, standard administrative divisions are State -> District -> Taluka -> Village.
            // I will assume 'city' in the enum refers to the Taluka level for this implementation, or I should ask.
            // But to proceed, I will require `taluka_id` if level is 'city'.
            if (!taluka_id) return res.status(400).json({ success: false, message: 'Taluka ID is required for city level.' });
            user.super_admin_taluka_id = taluka_id;
        } else if (level === 'village') {
            if (!village_id) return res.status(400).json({ success: false, message: 'Village ID is required for village level.' });
            user.super_admin_village_id = village_id;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'User assigned as Super Admin successfully.',
            data: user,
        });

    } catch (error) {
        console.error('Error assigning super admin:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};



const getSuperAdmins = async (req, res) => {
    try {
        const superAdmins = await User.findAll({
            where: { role: 'super_admin' },
            attributes: [
                'id', 'name', 'phone', 'email', 'role',
                'super_admin_level',
                'super_admin_state_id',
                'super_admin_district_id',
                'super_admin_taluka_id',
                'super_admin_village_id'
            ],
            include: [
                {
                    model: State,
                    as: 'adminState',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: District,
                    as: 'adminDistrict',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: Taluka,
                    as: 'adminTaluka',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: Village,
                    as: 'adminVillage',
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        });

        return res.status(200).json({
            success: true,
            data: superAdmins,
        });
    } catch (error) {
        console.error('Error fetching super admins:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['name', 'phone', 'role', 'super_admin_level']
        });

        return res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

const addMessage = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { message, recipient_ids } = req.body;
        const adminId = req.user.id;

        if (!message) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Message content is required.',
            });
        }

        if (!recipient_ids || !Array.isArray(recipient_ids) || recipient_ids.length === 0) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Recipient IDs are required and must be a non-empty array.',
            });
        }

        const newMessage = await AdminMessage.create({
            admin_id: adminId,
            message,
        }, { transaction: t });

        const recipientData = recipient_ids.map(superAdminId => ({
            message_id: newMessage.id,
            super_admin_id: superAdminId,
            is_read: false,
        }));

        console.log('Attempting to create recipients:', recipientData);

        const createdRecipients = await MessageRecipient.bulkCreate(recipientData, {
            transaction: t,
            ignoreDuplicates: false,
            validate: true
        });

        console.log('Created recipients count:', createdRecipients.length);

        await t.commit();

        return res.status(201).json({
            success: true,
            message: 'Message added and sent to recipients successfully.',
            data: {
                message: newMessage,
                recipients_count: createdRecipients.length,
                recipients: createdRecipients,
            },
        });
    } catch (error) {
        await t.rollback();
        console.error('Error adding admin message:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

// Get all states with their districts
const getStates = async (req, res) => {
    try {
        const states = await State.findAll({
            attributes: ['id', 'name'],
            include: [{
                model: District,
                as: 'districts',
                attributes: ['id', 'name'],
                required: false
            }]
        });

        return res.status(200).json({
            success: true,
            data: states
        });
    } catch (error) {
        console.error('Error fetching states:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching states',
            error: error.message
        });
    }
};

// Get districts by state ID with their talukas
const getDistrictsByState = async (req, res) => {
    try {
        const { stateId } = req.params;

        if (!stateId) {
            return res.status(400).json({
                success: false,
                message: 'State ID is required'
            });
        }

        const districts = await District.findAll({
            where: { state_id: stateId },
            attributes: ['id', 'name'],
            include: [{
                model: Taluka,
                as: 'talukas',
                attributes: ['id', 'name'],
                required: false
            }]
        });

        return res.status(200).json({
            success: true,
            data: districts
        });
    } catch (error) {
        console.error('Error fetching districts:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching districts',
            error: error.message
        });
    }
};

// Get talukas by district ID with their villages
const getTalukasByDistrict = async (req, res) => {
    try {
        const { districtId } = req.params;

        if (!districtId) {
            return res.status(400).json({
                success: false,
                message: 'District ID is required'
            });
        }

        const talukas = await Taluka.findAll({
            where: { district_id: districtId },
            attributes: ['id', 'name'],
            include: [{
                model: Village,
                as: 'villages',
                attributes: ['id', 'name'],
                required: false
            }]
        });

        return res.status(200).json({
            success: true,
            data: talukas
        });
    } catch (error) {
        console.error('Error fetching talukas:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching talukas',
            error: error.message
        });
    }
};

// Get all locations in a single API call (nested)
const getAllLocations = async (req, res) => {
    try {
        const locations = await State.findAll({
            attributes: ['id', 'name'],
            include: [{
                model: District,
                as: 'districts',
                attributes: ['id', 'name'],
                include: [{
                    model: Taluka,
                    as: 'talukas',
                    attributes: ['id', 'name'],
                    include: [{
                        model: Village,
                        as: 'villages',
                        attributes: ['id', 'name']
                    }]
                }]
            }]
        });

        return res.status(200).json({
            success: true,
            data: locations
        });
    } catch (error) {
        console.error('Error fetching all locations:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching locations',
            error: error.message
        });
    }
};

module.exports = {
    getFarmersList,
    updateFarmerStatus,
    assignSuperAdmin,
    getSuperAdmins,
    getUsers,
    addMessage,
    getStates,
    getDistrictsByState,
    getTalukasByDistrict,
    getAllLocations
};
