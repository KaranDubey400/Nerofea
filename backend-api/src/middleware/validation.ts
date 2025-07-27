import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation schemas
const noteSchema = Joi.object({
  topic_id: Joi.string().required(),
  title: Joi.string().min(1).max(255).required(),
  content: Joi.string().allow(''),
  user_id: Joi.string().required(),
});

const noteUpdateSchema = Joi.object({
  topic_id: Joi.string(),
  title: Joi.string().min(1).max(255),
  content: Joi.string().allow(''),
});

const topicSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  user_id: Joi.string().required(),
});

// Validation middleware functions
export const validateNote = (req: Request, res: Response, next: NextFunction) => {
  const { error } = noteSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateNoteUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { error } = noteUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateTopic = (req: Request, res: Response, next: NextFunction) => {
  const { error } = topicSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Generic validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
}; 