const soap = require('soap');

const createSoapClient = async (wsdlUrl) => {
  return new Promise((resolve, reject) => {
    soap.createClient(wsdlUrl, (err, client) => {
      if (err) {
        return reject(err);
      }
      resolve(client);
    });
  });
};

module.exports = { createSoapClient };
