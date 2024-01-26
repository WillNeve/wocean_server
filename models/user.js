const { pool } = require('../db/dbConfig')

const create = async (userInfos) => {
  const queryObj = await pool.query(
    'INSERT INTO wocean_users (username, email, password, salt) VALUES ($1, $2, $3, $4) RETURNING *',
    [userInfos.username, userInfos.email, userInfos.password, userInfos.salt]
  );
  const user = queryObj.rows[0];
  return user.id;
}


module.exports = {
  create,
}
