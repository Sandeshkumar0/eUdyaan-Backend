const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Discussion = sequelize.define('Discussion', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { len: [1, 5000] }
  },
  media: {
    type: DataTypes.STRING(2048)
  },
  anonymous: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [{ fields: ['createdAt'] }]
});

const Comment = sequelize.define('Comment', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  discussionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { len: [1, 3000] }
  },
  anonymous: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true
});

const Reply = sequelize.define('Reply', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { len: [1, 3000] }
  },
  anonymous: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true
});

const Like = sequelize.define('Like', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  discussionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  indexes: [{ unique: true, fields: ['userId', 'discussionId'] }]
});

module.exports = { Discussion, Comment, Reply, Like };
