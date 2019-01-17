/*
* 初始化client
*/
const legal_client = require('./legal-client');
const config = require('./config.json');
const SyncServices = require('./sync/SyncServices');
const CRUDServices = require('../../dbs/CRUDService');

class FabricClient {
  constructor (persistence) {
    this.client;
    this.syncservice;
    this.persistence = persistence;
    this.blocksSyncTime = config.blocksSyncTime;
    this.defaultPeer = {};
    this.defaultChannel = {};
    this.peer = {};
  }
  async initialize () {
    const username = config.admins[0].username;
    const userorg = config.OrgName;
    this.client = await legal_client.createdFabricClient(username, userorg);
    const defaultChannelName = await this.client.getConfigSetting('channelName');
    const defaultPeerName = await this.client.getConfigSetting('peerName');
    this.defaultChannel = await this.client.getChannel(defaultChannelName, true);
    this.defaultPeer = this.defaultChannel.getPeer(defaultPeerName);
    this.syncservice = new SyncServices(this.client, this.persistence);
    setInterval(async () => {
      this.syncservice.getAllBlocks(defaultChannelName);
      this.syncservice.getChannels(defaultPeerName);
      this.syncservice.getPeers(this.defaultChannel);
    }, this.blocksSyncTime);
    return this.client;
  }
  setPersistenceService () {
    this.persistence.setCrudService(
      new CRUDServices()
    );
  }
}

module.exports = FabricClient;
