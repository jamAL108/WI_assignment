import db from '../setup.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_secret_key';

export const registerUser = async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role || 'user']
    );
    res.send('User registered successfully');
  } catch (err) {
    console.log(err)
    res.status(500).send('Error registering user');
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).send('Invalid credentials');

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
    res.json({ token });
  } catch (err) {
    res.status(500).send('Error logging in');
  }
};

export const getSeatAvailability = async (req, res) => {
  const { source, destination } = req.query;
  try {
    const [results] = await db.execute(
      'SELECT t.id, t.name, t.source, t.destination, s.available_seats FROM trains t JOIN seat_availability s ON t.id = s.train_id WHERE t.source = ? AND t.destination = ?',
      [source, destination]
    );
    res.json(results);
  } catch (err) {
    res.status(500).send('Error fetching trains');
  }
};

export const bookSeat = async (req, res) => {
  const { train_id, seats } = req.body;
  const user_id = req.user.id;

  try {
    const connection = await db.getConnection();

    await connection.beginTransaction();
    const [results] = await connection.execute(
      'SELECT available_seats FROM seat_availability WHERE train_id = ? FOR UPDATE',
      [train_id]
    );

    if (results.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).send('Train not found');
    }

    const availableSeats = results[0].available_seats;
    if (availableSeats < seats) {
      await connection.rollback();
      connection.release();
      return res.status(400).send('Not enough seats available');
    }

    await connection.execute(
      'UPDATE seat_availability SET available_seats = ? WHERE train_id = ?',
      [availableSeats - seats, train_id]
    );

    await connection.execute(
      'INSERT INTO bookings (user_id, train_id, seats_booked) VALUES (?, ?, ?)',
      [user_id, train_id, seats]
    );

    await connection.commit();
    connection.release();

    res.send('Booking successful');
  } catch (err) {
    res.status(500).send('Error booking seat');
  }
};
