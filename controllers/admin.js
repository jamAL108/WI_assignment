import db from '../setup.js';

export const addTrain = async (req, res) => {
  const { name, source, destination, total_seats } = req.body;
  if (!req.admin || !req.admin.api_key) {
    return res.status(403).send('Unauthorized access');
  }
  try {
    const [result] = await db.execute(
      'INSERT INTO trains (name, source, destination, total_seats) VALUES (?, ?, ?, ?)',
      [name, source, destination, total_seats]
    );

    await db.execute(
      'INSERT INTO seat_availability (train_id, available_seats) VALUES (?, ?)',
      [result.insertId, total_seats]
    );

    res.send('Train added successfully');
  } catch (err) {
    res.status(500).send('Error adding train');
  }
};
