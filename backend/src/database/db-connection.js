const { Sequelize } = require('sequelize');
const databaseConfig = require('./db-config.json');

const sequelize = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, {
    host: databaseConfig.host,
    dialect: databaseConfig.dialect
});

const authenticateConnectionToDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

authenticateConnectionToDB();

module.exports = sequelize;