class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  applyUserFilter(filter, userId) {
    if (userId) {
      return { ...filter, user: userId };
    }
    return filter;
  }
  // Common CRUD methods
  async findById(id) {
    return this.model.findById(id).exec();
  }

  async findOne(filter = {}) {
    return this.model.findOne(filter).exec();
  }

  // `options` can include: sort, limit, skip, select
  async find(filter = {}, options = {}, userId = null) {
    const {
      sort = { createdAt: -1 },
      limit = 0,
      skip = 0,
      select = null,
    } = options;

    const finalFilter = this.applyUserFilter(filter, userId);

    let query = this.model.find(finalFilter);

    if (select) query = query.select(select);
    if (sort) query = query.sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);

    return query.exec();
  }

  async create(data) {
    const document = new this.model(data);
    return document.save();
  }

  async updateSecure(id, userId, data) {
    // `new` option deprecated; prefer `returnDocument: 'after'`
    return this.model
      .findOneAndUpdate({ _id: id, user: userId }, data, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();
  }

  async deleteSecure(id, userId) {
    return this.model.findOneAndDelete({ _id: id, user: userId }).exec();
  }

  async count(filter = {}, userId = null) {
    const finalFilter = this.applyUserFilter(filter, userId);
    return this.model.countDocuments(finalFilter).exec();
  }
}

export default BaseRepository;
