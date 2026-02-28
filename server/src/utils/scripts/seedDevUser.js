import User from '../../models/User.js';

const isTruthy = (value) => {
  if (value === undefined || value === null) return false;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const findAvailableUsername = async (baseUsername) => {
  let candidate = baseUsername;
  let counter = 1;

  // Keep usernames unique if default one already exists for another account.
  while (await User.exists({ username: candidate })) {
    counter += 1;
    candidate = `${baseUsername}${counter}`;
  }

  return candidate;
};

const seedDevUser = async () => {
  if (process.env.NODE_ENV !== 'development') return;

  const enabled =
    process.env.SEED_DEV_USER === undefined ||
    process.env.SEED_DEV_USER === ''
      ? true
      : isTruthy(process.env.SEED_DEV_USER);

  if (!enabled) return;

  try {
    const email = process.env.DEV_USER_EMAIL || 'dev@quizflip.dev';
    const username = process.env.DEV_USER_USERNAME || 'devuser';
    const password = process.env.DEV_USER_PASSWORD || 'devpass123';
    const role = process.env.DEV_USER_ROLE === 'admin' ? 'admin' : 'user';

    const existing = await User.findOne({ email }).select(
      '_id email username role',
    );
    if (existing) {
      console.log(
        `[seed] Dev user already exists: ${existing.email} (${existing.username}, role=${existing.role})`,
      );
      return;
    }

    const availableUsername = await findAvailableUsername(username);
    await User.create({
      username: availableUsername,
      email,
      password,
      role,
      isActive: true,
    });

    console.log(
      `[seed] Dev user created: ${email} (${availableUsername}, role=${role})`,
    );
  } catch (error) {
    console.error(`[seed] Dev user seed skipped: ${error.message}`);
  }
};

export default seedDevUser;
