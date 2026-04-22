const JournalEntry = require('../Models/JournalEntry');


const getEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createEntry = async (req, res) => {
  try {
    const { title, content, dateString } = req.body;

    const entry = await JournalEntry.create({
      user: req.user.id,
      title: title || 'New Journal Entry',
      content: content || '',
      dateString: dateString || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateEntry = async (req, res) => {
  try {
    const { title, content } = req.body;
    let entry = await JournalEntry.findById(req.params.id);

    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    if (entry.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    entry.title = title !== undefined ? title : entry.title;
    entry.content = content !== undefined ? content : entry.content;

    const updatedEntry = await entry.save();
    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    if (entry.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await entry.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry
};
