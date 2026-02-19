class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    return this.model.findById(id).exec();
  }

  async findOne(filter = {}) {
    return this.model.findOne(filter).exec();
  }

  async find(filter = {}, options = {}) {
    const {
      sort = { createdAt: -1 },
      limit = 0,
      skip = 0,
      select = null,
    } = options;

    let query = this.model.find(filter);

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

  async update(id, data) {
    return this.model
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter).exec();
  }
}

export default BaseRepository;
