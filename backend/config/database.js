const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
// Para Vercel, usar /tmp directory para SQLite
const DB_PATH = process.env.NODE_ENV === 'production' 
    ? '/tmp/rhpro.db' 
    : path.join(__dirname, '../database/rhpro.db');

// Criar instância do banco
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com SQLite:', err.message);
  } else {
    console.log('🗄️  SQLite conectado com sucesso!');
    console.log(`📍 Banco de dados: ${DB_PATH}`);
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// Função para criar todas as tabelas
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela de usuários
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          user_type TEXT NOT NULL CHECK(user_type IN ('empresa', 'candidato', 'admin')),
          is_active BOOLEAN DEFAULT 1,
          last_login DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de informações da empresa
      db.run(`
        CREATE TABLE IF NOT EXISTS company_info (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL,
          cnpj TEXT,
          description TEXT,
          website TEXT,
          sector TEXT,
          company_size TEXT,
          logo_url TEXT,
          street TEXT,
          city TEXT,
          state TEXT,
          zip_code TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Tabela de informações do candidato
      db.run(`
        CREATE TABLE IF NOT EXISTS candidate_info (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL,
          phone TEXT,
          date_of_birth DATE,
          street TEXT,
          city TEXT,
          state TEXT,
          zip_code TEXT,
          resume_url TEXT,
          linkedin_url TEXT,
          github_url TEXT,
          portfolio_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Tabela de habilidades do candidato
      db.run(`
        CREATE TABLE IF NOT EXISTS candidate_skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          skill_name TEXT NOT NULL,
          level TEXT CHECK(level IN ('basico', 'intermediario', 'avancado', 'especialista')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Tabela de experiência profissional
      db.run(`
        CREATE TABLE IF NOT EXISTS work_experience (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          company_name TEXT NOT NULL,
          position TEXT NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE,
          is_current BOOLEAN DEFAULT 0,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Tabela de formação acadêmica
      db.run(`
        CREATE TABLE IF NOT EXISTS education (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          institution TEXT NOT NULL,
          degree TEXT NOT NULL,
          field_of_study TEXT,
          graduation_year INTEGER,
          status TEXT CHECK(status IN ('concluido', 'cursando', 'interrompido')) DEFAULT 'concluido',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Tabela de vagas
      db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          requirements TEXT NOT NULL,
          location TEXT NOT NULL,
          work_mode TEXT NOT NULL CHECK(work_mode IN ('presencial', 'remoto', 'hibrido')),
          contract_type TEXT NOT NULL CHECK(contract_type IN ('clt', 'pj', 'estagio', 'freelancer', 'temporario')),
          experience_level TEXT NOT NULL CHECK(experience_level IN ('estagiario', 'junior', 'pleno', 'senior', 'especialista')),
          category TEXT NOT NULL CHECK(category IN ('tecnologia', 'design', 'marketing', 'vendas', 'rh', 'financeiro', 'operacoes', 'outros')),
          salary_min DECIMAL(10,2),
          salary_max DECIMAL(10,2),
          salary_period TEXT CHECK(salary_period IN ('mensal', 'quinzenal', 'semanal', 'por-hora')) DEFAULT 'mensal',
          vacancies INTEGER DEFAULT 1,
          urgency TEXT CHECK(urgency IN ('baixa', 'media', 'alta', 'critica')) DEFAULT 'media',
          status TEXT CHECK(status IN ('ativa', 'pausada', 'fechada', 'rascunho')) DEFAULT 'ativa',
          application_deadline DATE,
          additional_info TEXT,
          applications_count INTEGER DEFAULT 0,
          views INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Tabela de benefícios da vaga
      db.run(`
        CREATE TABLE IF NOT EXISTS job_benefits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id INTEGER NOT NULL,
          benefit_name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
        )
      `);

      // Tabela de habilidades necessárias para a vaga
      db.run(`
        CREATE TABLE IF NOT EXISTS job_skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id INTEGER NOT NULL,
          skill_name TEXT NOT NULL,
          is_required BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
        )
      `);

      // Tabela de candidaturas
      db.run(`
        CREATE TABLE IF NOT EXISTS applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id INTEGER NOT NULL,
          candidate_id INTEGER NOT NULL,
          status TEXT CHECK(status IN ('novo', 'em-analise', 'entrevista', 'aprovado', 'reprovado', 'desistiu')) DEFAULT 'novo',
          cover_letter TEXT,
          resume_url TEXT,
          notes TEXT,
          interview_date DATETIME,
          feedback TEXT,
          withdrawn_at DATETIME,
          withdrawn_reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
          FOREIGN KEY (candidate_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(job_id, candidate_id)
        )
      `);

      // Tabela de histórico de status das candidaturas
      db.run(`
        CREATE TABLE IF NOT EXISTS application_status_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          application_id INTEGER NOT NULL,
          status TEXT NOT NULL,
          changed_by INTEGER,
          notes TEXT,
          changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
          FOREIGN KEY (changed_by) REFERENCES users (id)
        )
      `);

      // Tabela de vagas salvas pelos candidatos
      db.run(`
        CREATE TABLE IF NOT EXISTS saved_jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          candidate_id INTEGER NOT NULL,
          job_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (candidate_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
          UNIQUE(candidate_id, job_id)
        )
      `);

      // Tabela de notificações
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT CHECK(type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
          is_read BOOLEAN DEFAULT 0,
          related_id INTEGER,
          related_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Triggers para atualizar updated_at
      db.run(`
        CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
        AFTER UPDATE ON users
        BEGIN
          UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `);

      db.run(`
        CREATE TRIGGER IF NOT EXISTS update_jobs_timestamp 
        AFTER UPDATE ON jobs
        BEGIN
          UPDATE jobs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `);

      db.run(`
        CREATE TRIGGER IF NOT EXISTS update_applications_timestamp 
        AFTER UPDATE ON applications
        BEGIN
          UPDATE applications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `);

      // Trigger para adicionar histórico quando status de candidatura muda
      db.run(`
        CREATE TRIGGER IF NOT EXISTS add_application_status_history 
        AFTER UPDATE OF status ON applications
        WHEN OLD.status != NEW.status
        BEGIN
          INSERT INTO application_status_history (application_id, status, changed_at)
          VALUES (NEW.id, NEW.status, CURRENT_TIMESTAMP);
        END
      `);

      console.log('✅ Tabelas criadas com sucesso!');
      resolve();
    });
  });
};

// Função para inserir dados iniciais
const seedDatabase = () => {
  return new Promise((resolve, reject) => {
    // Verificar se já existe usuário admin
    db.get('SELECT id FROM users WHERE user_type = "admin"', (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (!row) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 12);
        
        // Criar usuário admin padrão
        db.run(`
          INSERT INTO users (name, email, password, user_type)
          VALUES (?, ?, ?, ?)
        `, ['Administrador', 'admin@rhpro.com', hashedPassword, 'admin'], (err) => {
          if (err) {
            console.error('Erro ao criar admin:', err);
            reject(err);
          } else {
            console.log('👤 Usuário admin criado com sucesso!');
            console.log('📧 Email: admin@rhpro.com');
            console.log('🔑 Senha: admin123');
            resolve();
          }
        });
      } else {
        console.log('👤 Usuário admin já existe');
        resolve();
      }
    });
  });
};

// Inicializar banco de dados
const initDatabase = async () => {
  try {
    await createTables();
    await seedDatabase();
    console.log('🎉 Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  }
};

module.exports = {
  db,
  initDatabase
};