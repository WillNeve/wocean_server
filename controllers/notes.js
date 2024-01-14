const { pool } = require('../db/dbConfig')

const retrieve = async (req, res) => {
  const result = await pool.query('SELECT * FROM notes WHERE id = $1;', [req.params.note_id])
  const { id, title, body, updated_at} = result.rows[0];
  const responseObj = {
    message: `Your request for note #${id} was granted`,
    note: {
      id: id,
      title: title,
      body: body,
      updated_at: updated_at
    }
  }
  req.userId = id
  res.status(200).json(responseObj)
}

const getUserIdFromNote = async (req, res, next) => {
  const result = await pool.query('SELECT user_id FROM notes WHERE id = $1;', [req.params.note_id])
  if (result.rows[0]) {
    req.params.user_id = result.rows[0].user_id
    next()
  } else {
    res.status(404).message({message: 'Note not found'})
  }
}

const create = async (req, res) => {
  const userId = req.params.user_id;
  const result = await pool.query('INSERT INTO notes (title, body, user_id) VALUES ($1, $2, $3) RETURNING *;', ['Title', '[{"id": 0,"type": "p", "content": ""}]', userId]);
  if (result.rows[0]) {
    res.status(200).json({message: 'Note created succesfully', note: result.rows[0]});
  } else {
    res.status(500).json({message: 'Note could not be created at this time'});
  }
}

const persist = async (req, res) => {
  const result = await pool.query('UPDATE notes SET body = $1, title = $2, updated_at = $3 WHERE id = $4;', [JSON.stringify(req.body.body), req.body.title, new Date(), req.params.note_id]).catch((err) => {
    res.status(500).json({message: `Internal Server Error - note #${2} save failure `})
  });
  res.status(200).json({message: `Note #${2} saved succesfully`})
}

const retrieveAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC;', [req.params.user_id]);
    const notes = result.rows;
    res.status(200).json({message: 'You are authorized to get these notes', notes: notes})
  } catch {
    res.status(500).json({message: 'Error retrieving notes', notes: []})
  }
}

module.exports = {
  retrieve,
  persist,
  retrieveAll,
  getUserIdFromNote,
  create
}
