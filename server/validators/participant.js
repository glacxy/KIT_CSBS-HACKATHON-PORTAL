import { body } from 'express-validator'

export const registrationRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter a name between 2 and 100 characters.'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Enter a valid email address.'),
  body('phone').trim().matches(/^\+?[\d\s()-]{8,20}$/).withMessage('Enter a valid phone number.'),
  body('college').trim().isLength({ min: 2, max: 160 }),
  body('department').trim().isLength({ min: 2, max: 120 }),
  body('studyYear').trim().isLength({ min: 1, max: 30 }),
  body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }).withMessage('Password must be at least 8 characters and include uppercase, lowercase and a number.'),
]

export const profileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('phone').optional().trim().matches(/^\+?[\d\s()-]{8,20}$/),
  body('college').optional().trim().isLength({ min: 2, max: 160 }),
  body('department').optional().trim().isLength({ min: 2, max: 120 }),
  body('studyYear').optional().trim().isLength({ min: 1, max: 30 }),
  body('githubUrl').optional({ values: 'falsy' }).isURL({ protocols: ['http', 'https'], require_protocol: true }),
  body('linkedinUrl').optional({ values: 'falsy' }).isURL({ protocols: ['http', 'https'], require_protocol: true }),
  body('skills').optional().isArray({ max: 30 }),
  body('skills.*').optional().isString().trim().isLength({ min: 1, max: 50 }),
]
