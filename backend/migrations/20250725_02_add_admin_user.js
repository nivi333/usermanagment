const bcrypt = require('bcrypt');

exports.up = async function(knex) {
  // Check if admin user already exists
  const existingUser = await knex('users').where({ email: 'nivetha22000@gmail.com' }).first();
  
  if (!existingUser) {
    // Hash password for the admin user
    // Password meets standards: at least 8 chars, uppercase, lowercase, number
    const adminPassword = 'Admin1234';
    // Password validation
    const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(adminPassword);
    if (!isValid) {
      throw new Error('Admin password does not meet security requirements!');
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    if (hashedPassword.length < 60) {
      throw new Error('Generated bcrypt hash is too short! Hash: ' + hashedPassword);
    }
    
    // Insert admin user
    await knex('users').insert({
      email: 'nivetha22000@gmail.com',
      password: hashedPassword,
      role: 'admin',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    });
    
    console.log('Admin user nivetha22000@gmail.com created with password: admin123');
  } else {
    // Update existing user to admin role
    await knex('users')
      .where({ email: 'nivetha22000@gmail.com' })
      .update({ 
        role: 'admin',
        updated_at: knex.fn.now()
      });
    
    console.log('User nivetha22000@gmail.com updated to admin role');
  }
};

exports.down = function(knex) {
  // Remove the admin user
  return knex('users').where({ email: 'nivetha22000@gmail.com' }).del();
};
