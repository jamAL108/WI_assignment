import jwt from 'jsonwebtoken';
import db from '../setup.js';


const SECRET_KEY = 'your_secret_key';

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access Denied');
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
};

export const authorizeRole = (role) => (req, res, next) => {
  if (req.user.role !== role) return res.status(403).send('Access Denied');
  next();
};



export const validateApiKeyWithService = async (req, res, next) => {
    const providedApiKey = req.headers['x-api-key'];
    if (!providedApiKey) {
      return res.status(401).send('API Key is missing');
    }
  
    try {
      // Fetch admin details using API key
      const [rows] = await db.execute('SELECT * FROM apikey WHERE api_key = ? AND role = ?', [providedApiKey, 'admin']);
      if (rows.length === 0) {
        return res.status(403).send('Invalid API Key or insufficient permissions');
      }
  
      req.admin = rows[0]; // Attach admin details to the request
      next();
    } catch (err) {
      res.status(500).send('Error validating API Key');
    }
  };