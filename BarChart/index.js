const chartimport3 = require('./chart');

module.exports = async function (context, req) {
    try {
        const result = await chartimport3.createImage(req.body);
        const response = {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000'
          },
          body: Buffer.from(result.split(',')[1], 'base64')
        };
        context.res = response;
      } catch (error) {
        context.log.error(error);
        context.res = {
          status: 500,
          body: error.message
        };
      }
}