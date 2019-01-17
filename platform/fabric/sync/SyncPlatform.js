class SyncPlatform {
  static async build (persistence) {
    const FabricClient = require('../FabricClient');
    let client = new FabricClient(persistence);
    return client;
  }
}

module.exports = SyncPlatform;
