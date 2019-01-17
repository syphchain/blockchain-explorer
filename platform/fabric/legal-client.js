/*
* 注册client,返回client可以调用链上api
*/
const logger = require('log4js').getLogger('init-client');
const hfc = require('fabric-client');
require('./config.js');

async function getClientForOrg (userorg, username) {
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
  // 返回client实例
  return client;
}
async function getRegisteredUser (username, userorg) {
  try {
    let client = await getClientForOrg(userorg);
    var admins = hfc.getConfigSetting('admins');
    var channels = hfc.getConfigSetting('channelName');
    logger.info('admins -------->\n', admins);
    logger.info('channels -------->\n', channels);
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
      // 返回client实例
      return client;
    } else {
      throw new Error('User was not enrolled ');
    }
  } catch (error) {
    logger.error('Failed to get registered user: %s with error: %s', username, error.toString());
    return 'failed '+error.toString();
  }
}

async function createdFabricClient (username, userorg) {
  let client = await getRegisteredUser(username, userorg);
  return client;
}

exports.createdFabricClient = createdFabricClient;
exports.getClientForOrg = getClientForOrg;
exports.getRegisteredUser = getRegisteredUser;