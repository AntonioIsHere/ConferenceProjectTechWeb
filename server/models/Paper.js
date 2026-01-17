module.exports = (sequelize, DataTypes) => {
  const Paper = sequelize.define('Paper', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'ACCEPTED', 'REJECTED'),
      defaultValue: 'SUBMITTED'
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  });

  return Paper;
};
