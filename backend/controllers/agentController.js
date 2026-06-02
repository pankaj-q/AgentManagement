const Agent = require('../models/Agent');

const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select('-password').sort('-createdAt');
    res.json(agents);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const addAgent = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingAgent = await Agent.findOne({ email: email.toLowerCase() });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent with this email already exists' });
    }

    const agent = new Agent({ name, email, mobile, password });
    await agent.save();

    const agentData = agent.toObject();
    delete agentData.password;

    res.status(201).json(agentData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const  deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    await Agent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Agent deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAgents,
  addAgent,
  deleteAgent,
}
