const jwt = require('jsonwebtoken');
const Therapist = require('../models/Therapist');

const protectTherapist = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login first.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'theraloom_super_secure_jwt_secret_key_2026_india';
    const decoded = jwt.verify(token, secret);

    const therapist = await Therapist.findById(decoded.id);
    if (!therapist) {
      return res.status(401).json({
        success: false,
        message: 'Therapist associated with this token no longer exists.',
      });
    }

    req.therapist = therapist;
    req.user = {
      id: therapist._id.toString(),
      role: 'therapist',
      email: therapist.email,
      name: therapist.name,
      slug: therapist.slug,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please login again.',
    });
  }
};

/**
 * Optional authentication: attaches user if token is valid, but allows through if not.
 */
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'theraloom_super_secure_jwt_secret_key_2026_india';
    const decoded = jwt.verify(token, secret);
    const therapist = await Therapist.findById(decoded.id);
    if (therapist) {
      req.therapist = therapist;
      req.user = {
        id: therapist._id.toString(),
        role: 'therapist',
      };
    }
  } catch (err) {
    // Ignore invalid token on optional auth
  }
  next();
};

module.exports = { protectTherapist, optionalAuth };
