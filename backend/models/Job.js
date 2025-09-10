const { db } = require('../config/database');

class Job {
  // Criar vaga
  static create(jobData) {
    return new Promise((resolve, reject) => {
      const {
        company_id, title, description, requirements, location, work_mode,
        contract_type, experience_level, category, salary_min, salary_max,
        salary_period, vacancies, urgency, status, application_deadline,
        additional_info, benefits, skills
      } = jobData;

      db.run(`
        INSERT INTO jobs (
          company_id, title, description, requirements, location, work_mode,
          contract_type, experience_level, category, salary_min, salary_max,
          salary_period, vacancies, urgency, status, application_deadline, additional_info
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        company_id, title, description, requirements, location, work_mode,
        contract_type, experience_level, category, salary_min, salary_max,
        salary_period || 'mensal', vacancies || 1, urgency || 'media',
        status || 'ativa', application_deadline, additional_info
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }

        const jobId = this.lastID;

        // Inserir benefícios
        if (benefits && benefits.length > 0) {
          Job.addBenefits(jobId, benefits);
        }

        // Inserir habilidades
        if (skills && skills.length > 0) {
          Job.addSkills(jobId, skills);
        }

        Job.findById(jobId).then(resolve).catch(reject);
      });
    });
  }

  // Buscar vaga por ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT j.*, u.name as company_name, ci.description as company_description
        FROM jobs j
        JOIN users u ON j.company_id = u.id
        LEFT JOIN company_info ci ON u.id = ci.user_id
        WHERE j.id = ?
      `, [id], async (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        try {
          const benefits = await Job.getBenefits(id);
          const skills = await Job.getSkills(id);

          resolve({
            ...row,
            benefits,
            skills
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Adicionar benefícios
  static addBenefits(jobId, benefits) {
    return new Promise((resolve, reject) => {
      if (!benefits || benefits.length === 0) {
        resolve();
        return;
      }

      const stmt = db.prepare(`INSERT INTO job_benefits (job_id, benefit_name) VALUES (?, ?)`);
      
      benefits.forEach(benefit => {
        stmt.run(jobId, benefit);
      });
      
      stmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Buscar benefícios
  static getBenefits(jobId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT benefit_name FROM job_benefits WHERE job_id = ?
      `, [jobId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.benefit_name));
        }
      });
    });
  }

  // Adicionar habilidades
  static addSkills(jobId, skills) {
    return new Promise((resolve, reject) => {
      if (!skills || skills.length === 0) {
        resolve();
        return;
      }

      const stmt = db.prepare(`INSERT INTO job_skills (job_id, skill_name) VALUES (?, ?)`);
      
      skills.forEach(skill => {
        stmt.run(jobId, skill);
      });
      
      stmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Buscar habilidades
  static getSkills(jobId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT skill_name FROM job_skills WHERE job_id = ?
      `, [jobId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.skill_name));
        }
      });
    });
  }
}

module.exports = Job;