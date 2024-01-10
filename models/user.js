const { pool } = require('../db/dbConfig')

const create = async (userInfos) => {
  const queryObj = await pool.query(
    'INSERT INTO wocean_users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
    [userInfos.username, userInfos.email, userInfos.password]
  );
  const user = queryObj.rows[0];
  return user;
}


module.exports = {
  create,
}
