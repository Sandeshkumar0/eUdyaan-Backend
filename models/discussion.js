const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;
const User = require('./user');

const Discussion = sequelize.define('Discussion', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  media: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

const Comment = sequelize.define('Comment', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  discussionId: {
    type: DataTypes.INTEGER,
    references: {
      model: Discussion,
      key: 'id'
    },
    allowNull: false
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

const Reply = sequelize.define('Reply', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  commentId: {
    type: DataTypes.INTEGER,
    references: {
      model: Comment,
      key: 'id'
    },
    allowNull: false
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

const Like = sequelize.define('Like', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  discussionId: {
    type: DataTypes.INTEGER,
    references: {
      model: Discussion,
      key: 'id'
    },
    allowNull: false
  }
});


Discussion.belongsTo(User, { foreignKey: 'userId' });
Discussion.hasMany(Comment, { foreignKey: 'discussionId' });
Discussion.hasMany(Like, { foreignKey: 'discussionId' });

Comment.belongsTo(User, { foreignKey: 'userId' });
Comment.hasMany(Reply, { foreignKey: 'commentId' });

Reply.belongsTo(User, { foreignKey: 'userId' });

Like.belongsTo(User, { foreignKey: 'userId' });

module.exports = { Discussion, Comment, Reply, Like };