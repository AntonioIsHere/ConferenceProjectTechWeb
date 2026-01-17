const Sequelize = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./User')(sequelize, Sequelize);
db.Conference = require('./Conference')(sequelize, Sequelize);
db.Paper = require('./Paper')(sequelize, Sequelize);
db.Review = require('./Review')(sequelize, Sequelize);

// Associations
// Organizer -> Conferences
db.User.hasMany(db.Conference, { foreignKey: 'organizerId', as: 'organizedConferences' });
db.Conference.belongsTo(db.User, { foreignKey: 'organizerId', as: 'organizer' });

// Author -> Papers
db.User.hasMany(db.Paper, { foreignKey: 'authorId', as: 'authoredPapers' });
db.Paper.belongsTo(db.User, { foreignKey: 'authorId', as: 'author' });

// Conference -> Papers
db.Conference.hasMany(db.Paper, { foreignKey: 'conferenceId' });
db.Paper.belongsTo(db.Conference, { foreignKey: 'conferenceId' });

// Paper -> Reviews
db.Paper.hasMany(db.Review, { foreignKey: 'paperId' });
db.Review.belongsTo(db.Paper, { foreignKey: 'paperId' });

// User (Reviewer) -> Reviews
db.User.hasMany(db.Review, { foreignKey: 'reviewerId' });
db.Review.belongsTo(db.User, { foreignKey: 'reviewerId', as: 'reviewer' });

// Conference -> Reviewers (Many-to-Many for pool of reviewers)
// Or simply just assigned per paper. The requirement says "allocate a series of reviewers" to a conference, 
// and "On receiving an article, 2 reviewers are automatically allocated".
// So we probably need a pool of reviewers for a conference.
db.Conference.belongsToMany(db.User, { through: 'ConferenceReviewers', as: 'reviewers' });
db.User.belongsToMany(db.Conference, { through: 'ConferenceReviewers', as: 'reviewingConferences' });

module.exports = db;
