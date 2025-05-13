const { Sequelize, DataTypes } = require('sequelize');
const db = require('../db');

const Business = sequelize.define('Business', {
  business_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  business_name: {
    type: DataTypes.STRING(225),
    allowNull: false
  },
  business_email: {
    type: DataTypes.STRING(225),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  business_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(225),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(225),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(225),
    allowNull: true
  },
  business_description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  business_logo_url: {
    type: DataTypes.STRING(225),
    allowNull: true
  },
  license_image_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  commission_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  average_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    defaultValue: null,
    validate: {
      min: 0,
      max: 5
    }
  },
  has_ai_access: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  }
}, {
  tableName: 'businesses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Business;