const express = require('express');
const Job = require('../models/Job');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Listar vagas (público)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Construir filtros
    const filter = { status: 'ativa' };

    // Filtros de busca
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    if (req.query.workMode) {
      filter.workMode = req.query.workMode;
    }

    if (req.query.contractType) {
      filter.contractType = req.query.contractType;
    }

    if (req.query.experience) {
      filter.experience = req.query.experience;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filtro de salário
    if (req.query.salaryMin || req.query.salaryMax) {
      filter['salary.min'] = {};
      if (req.query.salaryMin) {
        filter['salary.min'].$gte = parseInt(req.query.salaryMin);
      }
      if (req.query.salaryMax) {
        filter['salary.max'].$lte = parseInt(req.query.salaryMax);
      }
    }

    // Ordenação
    let sort = { createdAt: -1 }; // Padrão: mais recentes primeiro
    
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'salary-high':
          sort = { 'salary.max': -1 };
          break;
        case 'salary-low':
          sort = { 'salary.min': 1 };
          break;
        case 'title':
          sort = { title: 1 };
          break;
        case 'company':
          sort = { 'companyData.name': 1 };
          break;
      }
    }

    const jobs = await Job.find(filter)
      .populate('company', 'name companyInfo')
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar vagas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Obter vaga por ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name companyInfo');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      });
    }

    // Incrementar views se não for o dono da vaga
    if (!req.user || req.user._id.toString() !== job.company._id.toString()) {
      await job.incrementViews();
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Erro ao buscar vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/jobs
// @desc    Criar nova vaga
// @access  Private/Empresa
router.post('/', authenticate, authorize('empresa'), async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      company: req.user._id
    };

    const job = new Job(jobData);
    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate('company', 'name companyInfo');

    res.status(201).json({
      success: true,
      message: 'Vaga criada com sucesso',
      job: populatedJob
    });
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Atualizar vaga
// @access  Private/Empresa (própria vaga)
router.put('/:id', authenticate, authorize('empresa'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      });
    }

    // Verificar se é o dono da vaga
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('company', 'name companyInfo');

    res.json({
      success: true,
      message: 'Vaga atualizada com sucesso',
      job: updatedJob
    });
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Excluir vaga
// @access  Private/Empresa (própria vaga) ou Admin
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

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

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vaga excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/jobs/company/:companyId
// @desc    Listar vagas de uma empresa
// @access  Private/Empresa (próprias vagas) ou Public (vagas ativas)
router.get('/company/:companyId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { company: req.params.companyId };

    // Se não for o dono ou admin, mostrar apenas vagas ativas
    if (!req.user || 
        (req.user._id.toString() !== req.params.companyId && req.user.userType !== 'admin')) {
      filter.status = 'ativa';
    }

    const jobs = await Job.find(filter)
      .populate('company', 'name companyInfo')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar vagas da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PATCH /api/jobs/:id/status
// @desc    Alterar status da vaga
// @access  Private/Empresa (própria vaga)
router.patch('/:id/status', authenticate, authorize('empresa'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      });
    }

    // Verificar se é o dono da vaga
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    job.status = status;
    await job.save();

    res.json({
      success: true,
      message: 'Status da vaga atualizado com sucesso',
      job
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
