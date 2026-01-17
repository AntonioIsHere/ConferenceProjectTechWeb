module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    status: {
      type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REVISION_REQUESTED'),
      defaultValue: 'PENDING'
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  return Review;
};
