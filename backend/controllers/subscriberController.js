// controllers/subscriberController.js
const Subscriber = require('../models/Subscriber');
const { sendEmail } = require('../utils/emailService');

// @desc    Get all subscribers
// @route   GET /api/subscribers
// @access  Private/Admin
exports.getAllSubscribers = async (req, res) => {
  try {
    // Get all active subscribers
    const subscribers = await Subscriber.find({ active: true }).sort({ subscriptionDate: -1 });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers',
      error: error.message
    });
  }
};

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    console.log('Subscribe endpoint hit');
    console.log('Request body:', req.body);

    const { email } = req.body;

    if (!email) {
      console.log('No email provided');
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    console.log('Processing subscription for email:', email);

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return res.status(400).json({
          success: false,
          message: 'This email is already subscribed to our newsletter'
        });
      } else {
        // Reactivate subscription
        existingSubscriber.active = true;
        await existingSubscriber.save();

        // Send welcome back email
        try {
          await sendEmail(
            email,
            'Welcome Back to AutoEase Newsletter!',
            `Thank you for resubscribing to our newsletter. You'll now receive updates on our latest offers and news.`
          );
        } catch (emailError) {
          console.error('Error sending welcome back email:', emailError);
        }

        return res.status(200).json({
          success: true,
          message: 'Your subscription has been reactivated'
        });
      }
    }

    // Create new subscriber
    const subscriber = await Subscriber.create({
      email
    });

    // Send welcome email
    try {
      console.log('Attempting to send welcome email to:', email);
      await sendEmail(
        email,
        'Welcome to AutoEase Newsletter!',
        `Thank you for subscribing to our newsletter. You'll now receive updates on our latest offers and news.`
      );
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Continue with the subscription process even if email fails
      console.log('Continuing with subscription despite email error');
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to the newsletter',
      data: subscriber
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe',
      error: error.message
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   DELETE /api/subscribers/:email
// @access  Public
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.params;

    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Soft delete - just mark as inactive
    subscriber.active = false;
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from the newsletter'
    });
  } catch (error) {
    console.error('Unsubscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe',
      error: error.message
    });
  }
};
