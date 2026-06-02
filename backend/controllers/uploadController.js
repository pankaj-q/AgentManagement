const XLSX = require('xlsx');
const fs = require('fs');
const Agent = require('../models/Agent');
const List = require('../models/List');
const mongoose = require('mongoose');

exports.uploadAndDistribute = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const filePath = req.file.path;

    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = '.' + req.file.originalname.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Only CSV, XLSX, and XLS files are allowed' });
    }

    const agents = await Agent.find();
    if (agents.length === 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'No agents found. Please add agents first.' });
    }

    let workbook;
    try {
      workbook = XLSX.readFile(filePath);
    } catch (parseErr) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Failed to parse file. Ensure it is a valid CSV or Excel file.' });
    }

    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    if (!data || data.length === 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'File is empty or could not be parsed' });
    }

    const rows = data.map((row) => {
      const keys = Object.keys(row);
      return {
        firstName: String(row[keys[0]] || '').trim(),
        phone: String(row[keys[1]] || '').trim(),
        notes: String(row[keys[2]] || '').trim(),
      };
    });

    const validRows = rows.filter((r) => r.firstName && r.phone);

    if (validRows.length === 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'No valid rows found. Ensure first two columns contain FirstName and Phone.' });
    }

    const batchId = new mongoose.Types.ObjectId();
    const totalAgents = agents.length;
    const baseCount = Math.floor(validRows.length / totalAgents);
    const extra = validRows.length % totalAgents;

    let index = 0;
    const distribution = [];

    for (let i = 0; i < totalAgents; i++) {
      const count = baseCount + (i < extra ? 1 : 0);
      const agentItems = [];
      for (let j = 0; j < count; j++) {
        const item = validRows[index++];
        agentItems.push({
          agent: agents[i]._id,
          firstName: item.firstName,
          phone: item.phone,
          notes: item.notes,
          batchId,
        });
      }
      distribution.push({ agent: agents[i], items: agentItems });
    }

    const allListItems = distribution.flatMap((d) => d.items);
    await List.insertMany(allListItems);

    const result = distribution.map((d) => ({
      agent: { id: d.agent._id, name: d.agent.name, email: d.agent.email },
      count: d.items.length,
      items: d.items.map((item) => ({
        firstName: item.firstName,
        phone: item.phone,
        notes: item.notes,
      })),
    }));

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: 'File uploaded and distributed successfully', distribution: result });

  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', err.message);
    res.status(500).json({ message: 'Server error while processing file' });
  }
};

exports.getDistributedLists = async (req, res) => {
  try {
    const batches = await List.distinct('batchId');
    if (batches.length === 0) {
      return res.json([]);
    }

    const latestBatchId = batches[batches.length - 1];

    const lists = await List.find({ batchId: latestBatchId })
      .populate('agent', 'name email')
      .sort({ agent: 1 })
      .lean();

    const grouped = {};
    for (const item of lists) {
      const agentId = item.agent._id.toString();
      if (!grouped[agentId]) {
        grouped[agentId] = {
          agent: item.agent,
          items: [],
        };
      }
      grouped[agentId].items.push({
        firstName: item.firstName,
        phone: item.phone,
        notes: item.notes,
      });
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error('Get lists error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
