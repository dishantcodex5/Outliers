import { Request, Response, NextFunction } from "express";

interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "email" | "array" | "object";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export function validateRequest(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      // Check required fields
      if (
        rule.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      // Skip validation if field is not required and not provided
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (rule.type) {
        switch (rule.type) {
          case "string":
            if (typeof value !== "string") {
              errors.push(`${rule.field} must be a string`);
            }
            break;
          case "number":
            if (typeof value !== "number" || isNaN(value)) {
              errors.push(`${rule.field} must be a number`);
            }
            break;
          case "boolean":
            if (typeof value !== "boolean") {
              errors.push(`${rule.field} must be a boolean`);
            }
            break;
          case "email":
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (typeof value !== "string" || !emailRegex.test(value)) {
              errors.push(`${rule.field} must be a valid email`);
            }
            break;
          case "array":
            if (!Array.isArray(value)) {
              errors.push(`${rule.field} must be an array`);
            }
            break;
          case "object":
            if (typeof value !== "object" || Array.isArray(value)) {
              errors.push(`${rule.field} must be an object`);
            }
            break;
        }
      }

      // String length validation
      if (typeof value === "string") {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(
            `${rule.field} must be at least ${rule.minLength} characters`,
          );
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(
            `${rule.field} must be no more than ${rule.maxLength} characters`,
          );
        }
      }

      // Number range validation
      if (typeof value === "number") {
        if (rule.min && value < rule.min) {
          errors.push(`${rule.field} must be at least ${rule.min}`);
        }
        if (rule.max && value > rule.max) {
          errors.push(`${rule.field} must be no more than ${rule.max}`);
        }
      }

      // Pattern validation
      if (
        rule.pattern &&
        typeof value === "string" &&
        !rule.pattern.test(value)
      ) {
        errors.push(`${rule.field} format is invalid`);
      }

      // Custom validation
      if (rule.custom) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          errors.push(
            typeof customResult === "string"
              ? customResult
              : `${rule.field} is invalid`,
          );
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Please check your input data",
        details: errors,
      });
    }

    next();
  };
}

// Common validation rules
export const emailValidation: ValidationRule = {
  field: "email",
  required: true,
  type: "email",
};

export const passwordValidation: ValidationRule = {
  field: "password",
  required: true,
  type: "string",
  minLength: 6,
  maxLength: 100,
};

export const nameValidation: ValidationRule = {
  field: "name",
  required: true,
  type: "string",
  minLength: 2,
  maxLength: 50,
};
