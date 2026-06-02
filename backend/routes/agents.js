const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAgents, addAgent, deleteAgent } = require('../controllers/agentController');

router.get('/', auth, getAgents);
router.post('/', auth, addAgent);
router.delete('/:id', auth, deleteAgent);

module.exports = router;
