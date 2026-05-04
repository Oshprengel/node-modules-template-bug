const cdk = require('aws-cdk');
const { Construct } = require('constructs');

class DemoStack extends Construct {
  constructor(scope, id) {
    super(scope, id);
  }
}

module.exports = { DemoStack };
