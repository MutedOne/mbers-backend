


import mysql from 'mysql2/promise'

const db = mysql.createPool({
    host: Bun.env.HOST,
    user: Bun.env.USERDB,
    database:  Bun.env.DATABASE,
    password: Bun.env.PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
export{
    db
}