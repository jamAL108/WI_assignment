import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_secret_key';

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
};
