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
  let folderId = null;
  let isFolder = req.query.isFolder === 'true';
  if (req.query.folder) {
    folderId = parseInt(req.query.folder, 10);
  }
  let result;
  if (folderId) {
    result = await pool.query('INSERT INTO notes (title, body, user_id, folder_id, folder) VALUES ($1, $2, $3, $4, $5) RETURNING *;', [isFolder ? 'Folder' : 'New note', '[{"id": 0,"type": "p", "content": ""}]', userId, folderId, isFolder]);
  } else {
    result = await pool.query('INSERT INTO notes (title, body, user_id, folder) VALUES ($1, $2, $3, $4) RETURNING *;', [isFolder ? 'Folder' : 'New note', '[{"id": 0,"type": "p", "content": ""}]', userId, isFolder]);
  }
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
  let folderId = null;
  if (req.query.folder) {
    folderId = parseInt(req.query.folder, 10);
  }

  try {
    if (folderId) {
      const notesQuery = await pool.query(`SELECT * FROM notes WHERE user_id = $1 AND folder_id = $2 ORDER BY note_order ASC;`, [req.params.user_id, folderId]);
      const notes = notesQuery.rows;
      const folderTitleQuery = await pool.query(`SELECT title FROM notes WHERE user_id = $1 AND id = $2`, [req.params.user_id, folderId]);
      const folderTitle = folderTitleQuery.rows[0].title;
      res.status(200).json({message: 'You are authorized to get these notes', folderTitle: folderTitle, notes: notes})
    } else {
      const notesQuery = await pool.query(`SELECT * FROM notes WHERE user_id = $1 AND folder_id IS NULL ORDER BY note_order ASC;`, [req.params.user_id]);
      const notes = notesQuery.rows;
      res.status(200).json({message: 'You are authorized to get these notes', notes: notes})
    }
  } catch {
    res.status(500).json({message: 'Error retrieving notes', notes: []})
  }
}

const saveAll = async (req, res) => {
  try {
    let authCount = 0;
    for (const noteUpdate of req.body) {
      const checkMatch = await pool.query('SELECT COUNT(*) FROM notes WHERE user_id = $1 AND id = $2;', [req.params.user_id, noteUpdate.id]);
      const authorizedForNote = parseInt(checkMatch.rows[0].count, 10) === 1;
      if (authorizedForNote) {
        authCount += 1;
      }
    }
    const authorized = authCount === req.body.length;
    if (authorized) {
      const orderCases = req.body.map((noteUpdate) => `WHEN id = ${noteUpdate.id} THEN ${noteUpdate.note_order}`);
      const folderChanges = req.body.filter((noteUpdate) => noteUpdate.folder_id !== null)
      const folderCases = folderChanges.map((noteUpdate) => `WHEN id = ${noteUpdate.id} THEN ${noteUpdate.folder_id}`);
      const iDs = req.body.map((noteUpdate) => noteUpdate.id)
      let query;
      if (folderCases.length > 0) {
        query = `UPDATE notes
        SET note_order =
          CASE
            ${orderCases.join(' ')}
          END,
        folder_id =
          CASE
            ${folderCases.join(' ')}
          END
        WHERE id IN (${iDs.join(', ')});`;
      } else {
        query = `UPDATE notes
        SET note_order =
          CASE
            ${orderCases.join(' ')}
          END
        WHERE id IN (${iDs.join(', ')});`;
      }
      try {
        await pool.query(query);
        res.status(200).json({message: 'Notes reorder saved!'})
      } catch {
        res.status(500).json({message: 'Error saving notes'})
      }
    } else {
      res.status(401).json({message: 'You are not authorized for one or more of these resources'})
    }
  } catch {
    res.status(500).json({message: 'Error saving notes'})
  }
}

const deleteSome = async (req, res) => {
  const ids = req.body;
  try {
    let authCount = 0;
    for (const id of ids) {
      const checkMatch = await pool.query('SELECT COUNT(*) FROM notes WHERE user_id = $1 AND id = $2;', [req.params.user_id, id]);
      const authorizedForNote = parseInt(checkMatch.rows[0].count, 10) === 1;
      if (authorizedForNote) {
        authCount += 1;
      }
    }
    const authorized = authCount === req.body.length;
    if (authorized) {
      const query = `DELETE FROM notes
      WHERE id IN (${ids.join(', ')});`;
      try {
        await pool.query(query);
        res.status(200).json({message: 'Notes reorder saved!'})
      } catch {
        res.status(500).json({message: 'Error saving notes'})
      }
    } else {
      res.status(401).json({message: 'You are not authorized for one or more of these resources'})
    }
  } catch {
    res.status(500).json({message: 'Error saving notes'})
  }
}

module.exports = {
  retrieve,
  persist,
  retrieveAll,
  getUserIdFromNote,
  create,
  saveAll,
  deleteSome
}
