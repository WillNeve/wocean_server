const { pool } = require('../db/dbConfig')

const retrieve = async (req, res) => {
  const result = await pool.query('SELECT * FROM notes WHERE id = $1;', [req.params.id])
  const { id, title, body, updated_at} = result.rows[0];
  const responseObj = {
    message: `Your request for note #${id} was granted`,
    page: {
      id: id,
      title: title,
      body: body,
      updated_at: updated_at
    }
  }
  res.status(200).json(responseObj)
}

const persist = async (req, res) => {
  console.log(req.body);
  const result = await pool.query('UPDATE notes SET body = $1, updated_at = $2 WHERE id = $3;', [JSON.stringify(req.body.body), new Date(), req.params.id]);
  const responseObj = {
    message: `Your request for saving note #${2} was granted`,
  }
  res.status(200).json(responseObj)
}

const retrieveAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC;', [req.params.id]);
    const notes = result.rows;
    res.status(200).json({message: 'You are authorized to get these notes', notes: notes})
  } catch {
    res.status(500).json({message: 'Error retrieving notes', notes: []})
  }
}

module.exports = {
  retrieve,
  persist,
  retrieveAll
}
