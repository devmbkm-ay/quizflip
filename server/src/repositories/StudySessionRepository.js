// temporary stub repository for study sessions
const studySessionRepository = {
  async create(data) {
    // simulate inserted session
    return { ...data, _id: 'session_stub', createdAt: new Date() };
  },
  async getCategoryBreakdown(userId, startDate) {
    // empty breakdown
    return [];
  },
  async find(filter, options = {}) {
    return [];
  },
};

export default studySessionRepository;
