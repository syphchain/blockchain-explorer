const swaggerJSDoc = require('swagger-jsdoc');

const port = process.env.PORT || '3000'
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'BlockChain explorer',
    version: '1.0.1',
    description: 'farbic of blcokchain explorer'
  },
  host: 'localhost:' + port,
  basePath: '/'
}
function swagger () {
  const options = {
    swaggerDefinition: swaggerDefinition,
    apis: ['./routes/*.js', './routes/**/*.js']
  }
  return swaggerJSDoc(options);
}

module.exports = swagger;