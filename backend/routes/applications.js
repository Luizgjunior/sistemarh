const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/applications
// @desc    Candidatar-se a uma vaga
// @access  Private/Candidato
router.post('/', authenticate, authorize('candidato'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Verificar se a vaga existe e está ativa
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'ativa') {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada ou não está ativa'
      });
    }

    // Verificar se já se candidatou
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Você já se candidatou a esta vaga'
      });
    }

    // Criar candidatura
    const application = new Application({
      job: jobId,
      candidate: req.user._id,
      coverLetter,
      resumeUrl: req.user.candidateInfo?.resume
    });

    await application.save();

    // Incrementar contador de candidaturas na vaga
    await job.incrementApplications();

    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title company location')
      .populate('candidate', 'name email candidateInfo');

    res.status(201).json({
      success: true,
      message: 'Candidatura realizada com sucesso',
      application: populatedApplication
    });
  } catch (error) {
    console.error('Erro ao candidatar-se:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/applications/my
// @desc    Listar candidaturas do usuário atual
// @access  Private/Candidato
router.get('/my', authenticate, authorize('candidato'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { candidate: req.user._id };

    // Filtro por status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate('job', 'title company location workMode contractType salary')
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name companyInfo'
        }
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar candidaturas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Listar candidatos de uma vaga
// @access  Private/Empresa (própria vaga) ou Admin
router.get('/job/:jobId', authenticate, async (req, res) => {
  try {
    // Verificar se a vaga existe
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      });
    }

    // Verificar permissão (dono da vaga ou admin)
    if (req.user.userType !== 'admin' && job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { job: req.params.jobId };

    // Filtro por status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate('candidate', 'name email candidateInfo')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar candidatos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Atualizar status da candidatura
// @access  Private/Empresa (vaga própria) ou Admin
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, notes, feedback, interviewDate } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidatura não encontrada'
      });
    }

    // Verificar permissão
    if (req.user.userType !== 'admin' && 
        application.job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Atualizar dados
    application.status = status;
    if (notes) application.notes = notes;
    if (feedback) application.feedback = feedback;
    if (interviewDate) application.interviewDate = interviewDate;

    await application.save();

    const updatedApplication = await Application.findById(application._id)
      .populate('candidate', 'name email candidateInfo')
      .populate('job', 'title company');

    res.json({
      success: true,
      message: 'Status da candidatura atualizado com sucesso',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Obter detalhes da candidatura
// @access  Private (candidato próprio, empresa da vaga ou admin)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email candidateInfo')
      .populate('job', 'title company location description requirements')
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name companyInfo'
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidatura não encontrada'
      });
    }

    // Verificar permissão
    const isCandidate = application.candidate._id.toString() === req.user._id.toString();
    const isCompany = application.job.company._id.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';

    if (!isCandidate && !isCompany && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Erro ao buscar candidatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Cancelar candidatura
// @access  Private/Candidato (própria candidatura)
router.delete('/:id', authenticate, authorize('candidato'), async (req, res) => {
  try {
    const { withdrawnReason } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidatura não encontrada'
      });
    }

    // Verificar se é o dono da candidatura
    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Verificar se pode cancelar (não pode cancelar se já foi aprovado)
    if (application.status === 'aprovado') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar uma candidatura aprovada'
      });
    }

    // Marcar como desistiu ao invés de excluir
    application.status = 'desistiu';
    application.withdrawnAt = new Date();
    application.withdrawnReason = withdrawnReason;

    await application.save();

    res.json({
      success: true,
      message: 'Candidatura cancelada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar candidatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/applications/company/stats
// @desc    Estatísticas de candidaturas da empresa
// @access  Private/Empresa
router.get('/company/stats', authenticate, authorize('empresa'), async (req, res) => {
  try {
    // Buscar todas as vagas da empresa
    const companyJobs = await Job.find({ company: req.user._id }).select('_id');
    const jobIds = companyJobs.map(job => job._id);

    // Estatísticas gerais
    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
    const newApplications = await Application.countDocuments({ 
      job: { $in: jobIds }, 
      status: 'novo' 
    });
    const inReview = await Application.countDocuments({ 
      job: { $in: jobIds }, 
      status: 'em-analise' 
    });
    const interviews = await Application.countDocuments({ 
      job: { $in: jobIds }, 
      status: 'entrevista' 
    });
    const approved = await Application.countDocuments({ 
      job: { $in: jobIds }, 
      status: 'aprovado' 
    });

    res.json({
      success: true,
      stats: {
        totalApplications,
        newApplications,
        inReview,
        interviews,
        approved
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
