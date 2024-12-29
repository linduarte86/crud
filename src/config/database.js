// Configura bando de dados

module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'admin',
  database: 'crud',
  define:{
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  }
};