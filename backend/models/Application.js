const { db } = require('../config/database');

class Application {
  // Criar candidatura
  static create(applicationData) {
    return new Promise((resolve, reject) => {
      const { job_id, candidate_id, cover_letter, resume_url } = applicationData;

      db.run(`
        INSERT INTO applications (job_id, candidate_id, cover_letter, resume_url)
        VALUES (?, ?, ?, ?)
      `, [job_id, candidate_id, cover_letter, resume_url], function(err) {
        if (err) {
          reject(err);
          return;
        }

        Application.findById(this.lastID).then(resolve).catch(reject);
      });
    });
  }

  // Buscar candidatura por ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT a.*, 
               u.name as candidate_name, u.email as candidate_email,
               j.title as job_title, j.company_id,
               c.name as company_name
        FROM applications a
        JOIN users u ON a.candidate_id = u.id
        JOIN jobs j ON a.job_id = j.id
        JOIN users c ON j.company_id = c.id
        WHERE a.id = ?
      `, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Listar candidaturas do candidato
  static findByCandidate(candidateId, filters = {}, page = 1, limit = 10) {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE a.candidate_id = ?';
      let params = [candidateId];

      if (filters.status) {
        whereClause += ' AND a.status = ?';
        params.push(filters.status);
      }

      // Buscar total
      db.get(`SELECT COUNT(*) as total FROM applications a ${whereClause}`, params, (err, countRow) => {
        if (err) {
          reject(err);
          return;
        }

        // Buscar dados paginados
        db.all(`
          SELECT a.*, 
                 j.title as job_title, j.location, j.work_mode, j.contract_type,
                 j.salary_min, j.salary_max,
                 c.name as company_name
          FROM applications a
          JOIN jobs j ON a.job_id = j.id
          JOIN users c ON j.company_id = c.id
          ${whereClause}
          ORDER BY a.created_at DESC
          LIMIT ? OFFSET ?
        `, [...params, limit, offset], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              applications: rows,
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

  // Listar candidatos de uma vaga
  static findByJob(jobId, filters = {}, page = 1, limit = 10) {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE a.job_id = ?';
      let params = [jobId];

      if (filters.status) {
        whereClause += ' AND a.status = ?';
        params.push(filters.status);
      }

      // Buscar total
      db.get(`SELECT COUNT(*) as total FROM applications a ${whereClause}`, params, (err, countRow) => {
        if (err) {
          reject(err);
          return;
        }

        // Buscar dados paginados
        db.all(`
          SELECT a.*, 
                 u.name as candidate_name, u.email as candidate_email,
                 ci.phone, ci.resume_url
          FROM applications a
          JOIN users u ON a.candidate_id = u.id
          LEFT JOIN candidate_info ci ON u.id = ci.user_id
          ${whereClause}
          ORDER BY a.created_at DESC
          LIMIT ? OFFSET ?
        `, [...params, limit, offset], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              applications: rows,
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

  // Atualizar status da candidatura
  static updateStatus(id, statusData) {
    return new Promise((resolve, reject) => {
      const { status, notes, feedback, interview_date } = statusData;
      
      db.run(`
        UPDATE applications 
        SET status = ?, notes = ?, feedback = ?, interview_date = ?
        WHERE id = ?
      `, [status, notes, feedback, interview_date, id], (err) => {
        if (err) {
          reject(err);
        } else {
          Application.findById(id).then(resolve).catch(reject);
        }
      });
    });
  }

  // Cancelar candidatura
  static withdraw(id, reason) {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE applications 
        SET status = 'desistiu', withdrawn_at = CURRENT_TIMESTAMP, withdrawn_reason = ?
        WHERE id = ?
      `, [reason, id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Verificar se já se candidatou
  static findByJobAndCandidate(jobId, candidateId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?
      `, [jobId, candidateId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Estatísticas para empresa
  static getCompanyStats(companyId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT a.status, COUNT(*) as count
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE j.company_id = ?
        GROUP BY a.status
      `, [companyId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const stats = {
            totalApplications: 0,
            newApplications: 0,
            inReview: 0,
            interviews: 0,
            approved: 0,
            rejected: 0
          };

          rows.forEach(row => {
            stats.totalApplications += row.count;
            
            switch (row.status) {
              case 'novo':
                stats.newApplications = row.count;
                break;
              case 'em-analise':
                stats.inReview = row.count;
                break;
              case 'entrevista':
                stats.interviews = row.count;
                break;
              case 'aprovado':
                stats.approved = row.count;
                break;
              case 'reprovado':
                stats.rejected = row.count;
                break;
            }
          });

          resolve(stats);
        }
      });
    });
  }
}

module.exports = Application;