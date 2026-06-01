export const validationMessages = {
  firstname: {
    "any.required": "Please enter firstname",
    "string.empty": "Firstname cannot be empty",
    "string.min": "Firstname must be at least 3 characters long",
    "string.max": "Firstname cannot exceed 50 characters",
  },

  lastname: {
    "any.required": "Please enter lastname",
    "string.empty": "Lastname cannot be empty",
    "string.min": "Lastname must be at least 3 characters long",
    "string.max": "Lastname cannot exceed 50 characters",
  },

  email: {
    "any.required": "Please enter email",
    "string.empty": "Email cannot be empty",
    "string.email": "Please enter a valid email address",
  },

  password: {
    "any.required": "Please enter a password",
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password cannot exceed 30 characters",
    "string.pattern.base":
      "Password must include uppercase, lowercase, number, and special character",
  },

  title: {
    "any.required": "Please enter event title",
    "string.empty": "Event title cannot be empty",
    "string.min": "Event title must be at least 3 characters long",
    "string.max": "Event title cannot exceed 100 characters",
  },

  description: {
    "any.required": "Please enter event description",
    "string.empty": "Event description cannot be empty",
    "string.min": "Description must be at least 10 characters long",
  },

  date: {
    "any.required": "Please select event date",
    "date.base": "Invalid date format",
    "date.min": "Event date cannot be in the past",
  },

  location: {
    "any.required": "Please enter event location",
    "string.empty": "Location cannot be empty",
    "string.min": "Location must be at least 3 characters long",
  },

  role: {
    "any.required": "Please select a role",
    "string.empty": "Role cannot be empty",
    "any.only": "Selected role is invalid",
  },
};
