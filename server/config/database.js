const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Create tables if they don't exist
const createTables = async () => {
  const queries = [
    // Admin users table
    `CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Portfolio items table
    `CREATE TABLE IF NOT EXISTS portfolio_items (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      image_url VARCHAR(500),
      category VARCHAR(100),
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Gallery images table
    `CREATE TABLE IF NOT EXISTS gallery_images (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      path VARCHAR(500) NOT NULL,
      url VARCHAR(500) NOT NULL,
      caption VARCHAR(500),
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Safaricom bundles table
    `CREATE TABLE IF NOT EXISTS bundles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      description TEXT NOT NULL,
      validity VARCHAR(100),
      data_amount VARCHAR(100),
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Contact messages table
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('Tables created successfully');
    
    // Create default admin user if not exists
    const bcrypt = require('bcryptjs');
    const defaultAdmin = {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User'
    };
    
    const checkAdmin = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [defaultAdmin.email]
    );
    
    if (checkAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);
      await pool.query(
        'INSERT INTO admin_users (email, password, name) VALUES ($1, $2, $3)',
        [defaultAdmin.email, hashedPassword, defaultAdmin.name]
      );
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

createTables();

module.exports = pool;
