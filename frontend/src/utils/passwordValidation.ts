// Password validation utility to ensure consistency across the application
// Matches backend validation: min 8 chars, 1 upper, 1 lower, 1 digit

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const PASSWORD_VALIDATION_RULES = [
  { required: true, message: 'Please input your password!' },
  { min: 8, message: 'Password must be at least 8 characters!' },
  {
    pattern: PASSWORD_REGEX,
    message: 'Password must be at least 8 characters, include uppercase, lowercase, and digit.',
  },
];

export const PASSWORD_VALIDATION_RULES_CREATE = [
  { required: true, message: 'Password is required' },
  {
    pattern: PASSWORD_REGEX,
    message: 'Password must be at least 8 characters, include uppercase, lowercase, and digit.',
  },
];

export const CONFIRM_PASSWORD_VALIDATION = (getFieldValue: (field: string) => any) => ({
  validator(_: any, value: string) {
    if (!value || getFieldValue('password') === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Passwords do not match!'));
  },
});

export const validatePassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};
