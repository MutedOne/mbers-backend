


import mysql from 'mysql2/promise'
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'taskmanagement',
    password: 'My7Pass@Word_9_8A_zE',
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