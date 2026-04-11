import pg from 'pg'

const { Pool } = pg

const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'personal_web_database',
  password: '',
  port: 5432,
})

export default db