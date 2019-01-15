
const logger = require('log4js').getLogger('fabric-client');
const fs = require('fs');
const path = require('path');
const config_path = path.resolve(__dirname, './config.json');
const fabric_const = require('./utils/FabricConst').fabric.const;
const FabricUtils = require('./utils/FabricUtils.js');
const hfc = require('fabric-client');
const client_utils = require('fabric-client/lib/client-utils.js');
require('./config.js');

class SyncFabricClient {
  constructor () {
    this.client
  }
  async getClientForOrg (userorg, username) {
    logger.debug('getClientForOrg - ****** START %s %s', userorg, username);
    let config = '-connection-profile-path';
    let client = hfc.loadFromConfig(hfc.getConfigSetting('network' + config));
    client.loadFromConfig(hfc.getConfigSetting(userorg + config));
    await client.initCredentialStores();
    if (username) {
      let user = await client.getUserContext(username, true);
      if (!user) {
        throw new Error(util.format('User was not found : ', username));
      } else {
        logger.debug('User %s was found to be registered and enrolled', username);
      }
    }
    logger.debug('getClientForOrg - ****** END %s %s \n\n', userorg, username);
    this.client = client;
    return client;
  }
  async getRegisteredUser (username, userorg, isJson) {
    try {
      let client = await this.getClientForOrg(userorg);
      logger.debug('Successfully initialized the credential stores');
        // client can now act as an agent for organization Org1
        // first check to see if the user is already enrolled
      var user = await client.getUserContext(username, true);
      if (user && user.isEnrolled()) {
        logger.info('Successfully loaded member from persistence');
        // 设置同步内容
      } else {
        // user was not enrolled, so we will need an admin user object to register
        logger.info('User %s was not enrolled, so we will need an admin user object to register',username);
        var admins = hfc.getConfigSetting('admins');
        logger.info('admins -------->\n', admins);
        let adminUserObj = await client.setUserContext({username: admins[0].username, password: admins[0].secret});
        let caClient = client.getCertificateAuthority();
        let secret = await caClient.register({
          enrollmentID: username,
          affiliation: userOrg.toLowerCase() + '.department1'
        }, adminUserObj);
        logger.debug('Successfully got the secret for user %s',username);
        user = await client.setUserContext({username:username, password:secret});
        logger.debug('Successfully enrolled username %s  and setUserContext on the client object', username);
      }
      if(user && user.isEnrolled) {
        if (isJson && isJson === true) {
          var response = {
            success: true,
            secret: user._enrollmentSecret,
            message: username + ' enrolled Successfully',
          };
          return response;
        }
      } else {
        throw new Error('User was not enrolled ');
      }
    } catch (error) {
      logger.error('Failed to get registered user: %s with error: %s', username, error.toString());
      return 'failed '+error.toString();
    }
  }
  async getChannelInfo () {
    setInterval(() => {
      let channel = this.client.getChannel('mychannel');
      let channelName = channel.getName();
      logger.info('channelName -------> \n', channelName, '\n');
      console.log(channel.getChannelPeers()[1]);
      channel.queryInfo(channel.getChannelPeers()[1]).then(data => {
        logger.info('queryInfo ----> \n', JSON.stringify(data));
      })
    }, 10000)
  }
}

module.exports = SyncFabricClient;