// subscription.routes.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: "process.env.RAZORPAY_KEY_ID",
    key_secret: "process.env.RAZORPAY_KEY_SECRET"
});

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 1. Get Subscription Plan Details
router.get('/api/subscription/plan/:planId', async (req, res) => {
    try {
        const { planId } = req.params;
        
        const [plans] = await pool.query(
            'SELECT * FROM subscription_plans WHERE plan_id = ? AND is_active = TRUE',
            [planId]
        );
        
        if (plans.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Plan not found' 
            });
        }
        
        res.json({ 
            success: true, 
            plan: plans[0] 
        });
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching plan details' 
        });
    }
});

// 2. Create Payment Link with Pre-filled Amount
router.post('/api/subscription/create-payment-link', async (req, res) => {
    try {
        const { userId, planId, userName, userEmail, userContact } = req.body;
        
        // Validate input
        if (!userId || !planId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID and Plan ID are required' 
            });
        }
        
        // Get plan details
        const [plans] = await pool.query(
            'SELECT * FROM subscription_plans WHERE plan_id = ? AND is_active = TRUE',
            [planId]
        );
        
        if (plans.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Plan not found' 
            });
        }
        
        const plan = plans[0];
        
        // Create Razorpay Payment Link
        const paymentLink = await razorpay.paymentLink.create({
            amount: plan.amount * 100, // Amount in paise
            currency: plan.currency,
            description: plan.plan_name,
            customer: {
                name: userName || 'Customer',
                email: userEmail || '',
                contact: userContact || ''
            },
            notify: {
                sms: true,
                email: true
            },
            reminder_enable: true,
            notes: {
                plan_id: planId,
                user_id: userId,
                billing_cycle: plan.billing_cycle
            },
            callback_url: `${process.env.BACKEND_URL}/api/subscription/payment-callback`,
            callback_method: 'get'
        });
        
        // Save subscription record
        const [result] = await pool.query(
            `INSERT INTO user_subscriptions 
            (user_id, plan_id, subscription_id, amount, currency, status) 
            VALUES (?, ?, ?, ?, ?, 'created')`,
            [userId, planId, paymentLink.id, plan.amount, plan.currency]
        );
        
        res.json({
            success: true,
            paymentLink: paymentLink.short_url,
            paymentLinkId: paymentLink.id,
            amount: plan.amount,
            subscriptionId: result.insertId
        });
        
    } catch (error) {
        console.error('Error creating payment link:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating payment link',
            error: error.message 
        });
    }
});

// 3. Create UPI Intent with Pre-filled Amount
router.post('/api/subscription/create-upi-intent', async (req, res) => {
    try {
        const { userId, planId, userName, userEmail, userContact } = req.body;
        
        if (!userId || !planId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID and Plan ID are required' 
            });
        }
        
        // Get plan details
        const [plans] = await pool.query(
            'SELECT * FROM subscription_plans WHERE plan_id = ? AND is_active = TRUE',
            [planId]
        );
        
        if (plans.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Plan not found' 
            });
        }
        
        const plan = plans[0];
        
        // Create Razorpay Order
        const order = await razorpay.orders.create({
            amount: plan.amount * 100,
            currency: plan.currency,
            notes: {
                plan_id: planId,
                user_id: userId
            }
        });
        
        // Save subscription record
        const [result] = await pool.query(
            `INSERT INTO user_subscriptions 
            (user_id, plan_id, razorpay_subscription_id, amount, currency, status) 
            VALUES (?, ?, ?, ?, ?, 'created')`,
            [userId, planId, order.id, plan.amount, plan.currency]
        );
        
        // Generate UPI payment URL with pre-filled amount
        const upiUrl = `upi://pay?pa=somayuinfotech@razorpay&pn=Somayu Infotech&am=${plan.amount}&cu=${plan.currency}&tn=${encodeURIComponent(plan.plan_name)}`;
        
        res.json({
            success: true,
            orderId: order.id,
            amount: plan.amount,
            currency: plan.currency,
            upiUrl: upiUrl,
            subscriptionId: result.insertId,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID
        });
        
    } catch (error) {
        console.error('Error creating UPI intent:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating UPI payment',
            error: error.message 
        });
    }
});

// 4. Verify Payment
router.post('/api/subscription/verify-payment', async (req, res) => {
    try {
        const { 
            razorpayPaymentId, 
            razorpayOrderId, 
            razorpaySignature,
            subscriptionId 
        } = req.body;
        
        // Verify signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');
        
        if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid payment signature' 
            });
        }
        
        // Update subscription status
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription
        
        await pool.query(
            `UPDATE user_subscriptions 
            SET status = 'active', 
                razorpay_subscription_id = ?,
                start_date = ?,
                end_date = ?
            WHERE id = ?`,
            [razorpayPaymentId, startDate, endDate, subscriptionId]
        );
        
        // Record transaction
        await pool.query(
            `INSERT INTO payment_transactions 
            (user_id, subscription_id, razorpay_payment_id, razorpay_order_id, 
             amount, status, payment_date) 
            SELECT user_id, id, ?, ?, amount, 'success', NOW()
            FROM user_subscriptions WHERE id = ?`,
            [razorpayPaymentId, razorpayOrderId, subscriptionId]
        );
        
        res.json({ 
            success: true, 
            message: 'Subscription activated successfully' 
        });
        
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error verifying payment' 
        });
    }
});

// 5. Payment Callback Handler
router.get('/api/subscription/payment-callback', async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_payment_link_id, razorpay_signature } = req.query;
        
        // Update subscription based on payment link id
        if (razorpay_payment_id) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
            
            await pool.query(
                `UPDATE user_subscriptions 
                SET status = 'active',
                    razorpay_subscription_id = ?,
                    start_date = ?,
                    end_date = ?
                WHERE subscription_id = ?`,
                [razorpay_payment_id, startDate, endDate, razorpay_payment_link_id]
            );
        }
        
        // Redirect to success page
        res.redirect(`${process.env.FRONTEND_URL}/payment-success?payment_id=${razorpay_payment_id}`);
        
    } catch (error) {
        console.error('Payment callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
});

// 6. Check User Subscription Status
router.get('/api/subscription/status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [subscriptions] = await pool.query(
            `SELECT us.*, sp.plan_name, sp.billing_cycle 
            FROM user_subscriptions us
            JOIN subscription_plans sp ON us.plan_id = sp.plan_id
            WHERE us.user_id = ? AND us.status = 'active' AND us.end_date > NOW()
            ORDER BY us.end_date DESC LIMIT 1`,
            [userId]
        );
        
        res.json({
            success: true,
            hasActiveSubscription: subscriptions.length > 0,
            subscription: subscriptions.length > 0 ? subscriptions[0] : null
        });
        
    } catch (error) {
        console.error('Error checking subscription status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error checking subscription status' 
        });
    }
});

module.exports = router;