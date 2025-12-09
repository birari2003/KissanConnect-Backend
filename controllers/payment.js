const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Subscription } = require('../models');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (req, res) => {
    console.log("started creating order", req.user);
    try {
        console.log('Create Order Request Initiated');
        console.log('User:', req.user);
        console.log('Razorpay Config:', {
            key_id_exists: !!process.env.RAZORPAY_KEY_ID,
            key_secret_exists: !!process.env.RAZORPAY_KEY_SECRET
        });

        const userId = req.user.id;
        const { amount = 499, currency = 'INR' } = req.body;

        const options = {
            amount: amount * 100, // Amount in paise
            currency: currency,
            receipt: `receipt_order_${Date.now()}`,
            notes: {
                user_id: userId
            }
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({
                success: false,
                message: 'Some error occured'
            });
        }

        // Create a pending subscription record
        await Subscription.create({
            user_id: userId,
            razorpay_order_id: order.id,
            amount: amount,
            currency: currency,
            status: 'pending'
        });

        return res.status(200).json({
            success: true,
            order_id: order.id,
            amount: amount,
            currency: currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {

            const startDate = new Date();
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1); // 1 year validity

            // Update subscription status
            const [updated] = await Subscription.update({
                status: 'active',
                razorpay_payment_id: razorpay_payment_id,
                razorpay_signature: razorpay_signature,
                start_date: startDate,
                end_date: endDate
            }, {
                where: {
                    razorpay_order_id: razorpay_order_id
                }
            });

            if (updated) {
                return res.status(200).json({
                    success: true,
                    message: 'Payment verified and subscription activated'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription record not found for this order'
                });
            }

        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }

    } catch (error) {
        console.error('Error verifying payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
