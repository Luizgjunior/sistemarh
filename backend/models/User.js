const { db } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  // Criar usuário
  static create(userData) {
    return new Promise((resolve, reject) => {
      const { name, email, password, userType, companyInfo, candidateInfo } = userData;
      
      // Hash da senha
      const hashedPassword = bcrypt.hashSync(password, 12);
      
      db.run(`
        INSERT INTO users (name, email, password, user_type)
        VALUES (?, ?, ?, ?)
      `, [name, email.toLowerCase(), hashedPassword, userType], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        const userId = this.lastID;
        
        // Inserir informações específicas do tipo de usuário
        if (userType === 'empresa' && companyInfo) {
          User.createCompanyInfo(userId, companyInfo);
        } else if (userType === 'candidato' && candidateInfo) {
          User.createCandidateInfo(userId, candidateInfo);
        }
        
        User.findById(userId).then(resolve).catch(reject);
      });
    });
  }

  // Buscar usuário por ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT id, name, email, user_type, is_active, last_login, created_at, updated_at
        FROM users WHERE id = ?
      `, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (!row) {
          resolve(null);
          return;
        }
        
        // Buscar informações adicionais baseadas no tipo de usuário
        if (row.user_type === 'empresa') {
          User.getCompanyInfo(id).then(companyInfo => {
            resolve({ ...row, companyInfo });
          }).catch(reject);
        } else if (row.user_type === 'candidato') {
          User.getCandidateInfo(id).then(candidateInfo => {
            resolve({ ...row, candidateInfo });
          }).catch(reject);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Buscar usuário por email (com senha)
  static findByEmailWithPassword(email) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT id, name, email, password, user_type, is_active, last_login, created_at, updated_at
        FROM users WHERE email = ? AND is_active = 1
      `, [email.toLowerCase()], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  // Comparar senha
  static comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compareSync(candidatePassword, hashedPassword);
  }

  // Gerar token JWT
  static generateAuthToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        userType: user.user_type,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }

  // Atualizar último login
  static updateLastLogin(id) {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
      `, [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Criar informações da empresa
  static createCompanyInfo(userId, companyInfo) {
    return new Promise((resolve, reject) => {
      const { cnpj, description, website, sector, company_size, street, city, state, zip_code } = companyInfo;
      
      db.run(`
        INSERT INTO company_info (user_id, cnpj, description, website, sector, company_size, street, city, state, zip_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, cnpj, description, website, sector, company_size, street, city, state, zip_code], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // Buscar informações da empresa
  static getCompanyInfo(userId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM company_info WHERE user_id = ?
      `, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || {});
        }
      });
    });
  }

  // Criar informações do candidato
  static createCandidateInfo(userId, candidateInfo) {
    return new Promise((resolve, reject) => {
      const { phone, date_of_birth, street, city, state, zip_code, linkedin_url, github_url, portfolio_url } = candidateInfo;
      
      db.run(`
        INSERT INTO candidate_info (user_id, phone, date_of_birth, street, city, state, zip_code, linkedin_url, github_url, portfolio_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, phone, date_of_birth, street, city, state, zip_code, linkedin_url, github_url, portfolio_url], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // Buscar informações do candidato
  static getCandidateInfo(userId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM candidate_info WHERE user_id = ?
      `, [userId], async (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve({});
          return;
        }

        try {
          // Buscar habilidades
          const skills = await User.getCandidateSkills(userId);
          // Buscar experiência
          const experience = await User.getWorkExperience(userId);
          // Buscar educação
          const education = await User.getEducation(userId);

          resolve({
            ...row,
            skills,
            experience,
            education
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Buscar habilidades do candidato
  static getCandidateSkills(userId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT skill_name, level FROM candidate_skills WHERE user_id = ?
      `, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // Buscar experiência profissional
  static getWorkExperience(userId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM work_experience WHERE user_id = ? ORDER BY start_date DESC
      `, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // Buscar educação
  static getEducation(userId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM education WHERE user_id = ? ORDER BY graduation_year DESC
      `, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // Atualizar usuário
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const { name } = updateData;
      
      db.run(`
        UPDATE users SET name = ? WHERE id = ?
      `, [name, id], (err) => {
        if (err) {
          reject(err);
        } else {
          User.findById(id).then(resolve).catch(reject);
        }
      });
    });
  }

  // Listar usuários (admin)
  static findAll(filters = {}, page = 1, limit = 10) {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      let params = [];

      if (filters.userType) {
        whereClause += ' AND user_type = ?';
        params.push(filters.userType);
      }

      if (filters.isActive !== undefined) {
        whereClause += ' AND is_active = ?';
        params.push(filters.isActive ? 1 : 0);
      }

      if (filters.search) {
        whereClause += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      // Buscar total
      db.get(`SELECT COUNT(*) as total FROM users ${whereClause}`, params, (err, countRow) => {
        if (err) {
          reject(err);
          return;
        }

        // Buscar dados paginados
        db.all(`
          SELECT id, name, email, user_type, is_active, last_login, created_at
          FROM users ${whereClause}
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `, [...params, limit, offset], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              users: rows,
              total: countRow.total,
              page,
              limit,
              pages: Math.ceil(countRow.total / limit)
            });
          }
        });
      });
    });
  }

  // Alterar senha
  static updatePassword(id, newPassword) {
    return new Promise((resolve, reject) => {
      const hashedPassword = bcrypt.hashSync(newPassword, 12);
      
      db.run(`
        UPDATE users SET password = ? WHERE id = ?
      `, [hashedPassword, id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Ativar/desativar usuário
  static updateStatus(id, isActive) {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE users SET is_active = ? WHERE id = ?
      `, [isActive ? 1 : 0, id], (err) => {
        if (err) {
          reject(err);
        } else {
          User.findById(id).then(resolve).catch(reject);
        }
      });
    });
  }

  // Excluir usuário
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

module.exports = User;