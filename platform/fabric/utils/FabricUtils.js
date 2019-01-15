const fs = require('fs');
const path = require('path');
const sha = require('js-sha256');
const asn = require('asn1.js');
const logger = require('../../../common/log4js').getLogger('fabric-utils');
function setOrgEnrolmentPath (network_config) {
  if (network_config && network_config.organizations) {
    for (const organization_name in network_config.organizations) {
      // checking files path is defined as full path or directory
      // if directory, then it will consider the first file
      const organization = network_config.organizations[organization_name];
      if (!organization.fullpath) {
        // setting admin private key as first file from keystore dir
        logger.debug(
          'Organization [%s] enrolment files path defined as directory',
          organization_name
        );
        if (organization.adminPrivateKey) {
          const privateKeyPath = organization.adminPrivateKey.path;
          var files = fs.readdirSync(privateKeyPath);
          if (files && files.length > 0) {
            organization.adminPrivateKey.path = path.join(
              privateKeyPath,
              files[0]
            );
          }
        }
        // setting admin private key as first file from signcerts dir
        if (organization.signedCert) {
          const signedCertPath = organization.signedCert.path;
          var files = fs.readdirSync(signedCertPath);
          if (files && files.length > 0) {
            organization.signedCert.path = path.join(signedCertPath, files[0]);
          }
        }
      } else {
        logger.debug(
          'Organization [%s] enrolment files path defined as full path',
          organization_name
        );
      }
    }
  }
  return network_config;
}

function cloneConfig (client_configs, client_name) {
  const global_hfc_config = JSON.parse(JSON.stringify(global.hfc.config));

  let client_config = global_hfc_config;
  client_config.client = client_configs.clients[client_name];
  client_config.version = client_configs.version;
  client_config.channels = client_configs.channels;
  client_config.organizations = client_configs.organizations;
  client_config.peers = client_configs.peers;
  client_config.orderers = client_configs.orderers;

  // modify url with respect to TLS enable
  client_config = processTLS_URL(client_config);
  return client_config;
}
function processTLS_URL (client_config) {
  for (const peer_name in client_config.peers) {
    const url = client_config.peers[peer_name].url;
    client_config.peers[peer_name].url = client_config.client.tlsEnable
      ? `grpcs${url.substring(url.indexOf('://'))}`
      : `grpc${url.substring(url.indexOf('://'))}`;
    if (client_config.peers[peer_name].eventUrl) {
      const eventUrl = client_config.peers[peer_name].eventUrl;
      client_config.peers[peer_name].eventUrl = client_config.client.tlsEnable
        ? `grpcs${eventUrl.substring(eventUrl.indexOf('://'))}`
        : `grpc${eventUrl.substring(eventUrl.indexOf('://'))}`;
    }
  }
  for (const ord_name in client_config.orderers) {
    const url = client_config.orderers[ord_name].url;
    client_config.orderers[ord_name].url = client_config.client.tlsEnable
      ? `grpcs${url.substring(url.indexOf('://'))}`
      : `grpc${url.substring(url.indexOf('://'))}`;
  }
  return client_config;
}

function validateClientConfig (client_config) {
  logger.debug('Client configuration >> %j ', client_config);
  let message = !client_config.version
    ? 'Client network version is not defined in configuration'
    : null;
  if (message) {
    logger.error(message);
    return false;
  }
  message = !client_config.client
    ? 'Client is not defined in configuration'
    : !client_config.client.organization
      ? 'Client organization is not defined in configuration'
      : !client_config.client.channel
        ? 'Client default channel is not defined in configuration '
        : !(
          client_config.client.credentialStore
            && client_config.client.credentialStore.path
        )
          ? 'Client credential store path is not defined in configuration '
          : !(
            client_config.client.credentialStore.cryptoStore
              && client_config.client.credentialStore.cryptoStore.path
          )
            ? 'Client crypto store path is not defined in configuration '
            : null;

  if (message) {
    logger.error(message);
    return false;
  }

  message = !client_config.channels
    ? 'Channels is not defined in configuration'
    : !client_config.channels[client_config.client.channel]
      ? `Default channel [${
        client_config.client.channel
      }] is not defined in configuration`
      : null;

  if (message) {
    logger.error(message);
    return false;
  }

  for (const channel_name in client_config.channels) {
    message = !(
      client_config.channels[channel_name].peers
      && Object.keys(client_config.channels[channel_name].peers).length > 0
    )
      ? `Default peer is not defined for channel [${channel_name}] in configuration`
      : !client_config.peers
        ? 'Peers is not defined in configuration'
        : !client_config.peers[
          Object.keys(client_config.channels[channel_name].peers)[0]
        ]
          ? `Default channel peers [${
            Object.keys(client_config.channels[channel_name].peers)[0]
          }] is not defined in configuration`
          : !(
            !client_config.client.tlsEnable
              || (client_config.peers[
                Object.keys(client_config.channels[channel_name].peers)[0]
              ].tlsCACerts
                && client_config.peers[
                  Object.keys(client_config.channels[channel_name].peers)[0]
                ].tlsCACerts.path)
          )
            ? `TLS CA Certs path is not defined default peer [${
              Object.keys(client_config.channels[channel_name].peers)[0]
            }] in configuration`
            : !client_config.peers[
              Object.keys(client_config.channels[channel_name].peers)[0]
            ].url
              ? `URL is not defined default peer [${
                Object.keys(client_config.channels[channel_name].peers)[0]
              }] in configuration`
              : !client_config.peers[
                Object.keys(client_config.channels[channel_name].peers)[0]
              ].eventUrl
                ? `Event URL is not defined default peer [${
                  Object.keys(client_config.channels[channel_name].peers)[0]
                }] in configuration`
                : !(
                  client_config.peers[
                    Object.keys(client_config.channels[channel_name].peers)[0]
                  ].grpcOptions
                    && client_config.peers[
                      Object.keys(client_config.channels[channel_name].peers)[0]
                    ].grpcOptions['ssl-target-name-override']
                )
                  ? `Server hostname is not defined default peer [${
                    Object.keys(client_config.channels[channel_name].peers)[0]
                  }] in configuration`
                  : null;

    if (message) {
      logger.error(message);
      return false;
    }
  }

  message = !client_config.organizations
    ? 'Organizations is not defined in configuration'
    : !client_config.organizations[client_config.client.organization]
      ? `Client organization [${
        client_config.client.organization
      }] is not defined in configuration`
      : !(
        client_config.organizations[client_config.client.organization]
          .signedCert
          && client_config.organizations[client_config.client.organization]
            .signedCert.path
      )
        ? `Client organization signed Cert path for [${
          client_config.client.organization
        }] is not defined in configuration`
        : null;

  if (message) {
    logger.error(message);
    return false;
  }

  for (const org_name in client_config.organizations) {
    message = !client_config.organizations[org_name].mspid
      ? `Organization mspid for [${org_name}] is not defined in configuration`
      : !(
        client_config.organizations[org_name].adminPrivateKey
          && client_config.organizations[org_name].adminPrivateKey.path
      )
        ? `Organization admin private key path for [${org_name}] is not defined in configuration`
        : null;

    if (message) {
      logger.error(message);
      return false;
    }
    message = !client_config.peers
      ? 'Peers is not defined in configuration'
      : !(
        !client_config.client.tlsEnable
          || (client_config.peers[
            Object.keys(
              client_config.channels[client_config.client.channel].peers
            )[0]
          ].tlsCACerts
            && client_config.peers[
              Object.keys(
                client_config.channels[client_config.client.channel].peers
              )[0]
            ].tlsCACerts.path)
      )
        ? `TLS CA Certs path is not defined default peer [${
          Object.keys(
            client_config.channels[client_config.client.channel].peers
          )[0]
        }] in configuration`
        : !client_config.peers[
          Object.keys(
            client_config.channels[client_config.client.channel].peers
          )[0]
        ].url
          ? `URL is not defined default peer [${
            Object.keys(
              client_config.channels[client_config.client.channel].peers
            )[0]
          }] in configuration`
          : !client_config.peers[
            Object.keys(
              client_config.channels[client_config.client.channel].peers
            )[0]
          ].eventUrl
            ? `Event URL is not defined default peer [${
              Object.keys(
                client_config.channels[client_config.client.channel].peers
              )[0]
            }] in configuration`
            : !(
              client_config.peers[
                Object.keys(
                  client_config.channels[client_config.client.channel].peers
                )[0]
              ].grpcOptions
                && client_config.peers[
                  Object.keys(
                    client_config.channels[client_config.client.channel].peers
                  )[0]
                ].grpcOptions['ssl-target-name-override']
            )
              ? `Server hostname is not defined default peer [${
                Object.keys(
                  client_config.channels[client_config.client.channel].peers
                )[0]
              }] in configuration`
              : null;
  }

  for (const peer_name in client_config.peers) {
    message = !client_config.peers[peer_name].url
      ? `Peer URL for [${peer_name}] is not defined in configuration`
      : null;
    if (message) {
      logger.error(message);
      return false;
    }
  }

  message = !client_config.orderers
    ? 'Orderers is not defined in configuration'
    : !Object.keys(client_config.orderers).length
      ? 'Default orderer is not defined in configuration'
      : !client_config.orderers[Object.keys(client_config.orderers)[0]].url
        ? 'Default orderer URL is not defined in configuration'
        : null;

  if (message) {
    logger.error(message);
    return false;
  }

  for (const ord_name in client_config.orderers) {
    message = !client_config.orderers[ord_name].url
      ? `Orderer URL for [${ord_name}] is not defined in configuration`
      : null;
    if (message) {
      logger.error(message);
      return false;
    }
  }
  return true;
}

async function getBlockTimeStamp (dateStr) {
  try {
    return new Date(dateStr);
  } catch (err) {
    logger.error(err);
  }
  return new Date(dateStr);
}

async function generateBlockHash (header) {
  const headerAsn = asn.define('headerAsn', function () {
    this.seq().obj(
      this.key('Number').int(),
      this.key('PreviousHash').octstr(),
      this.key('DataHash').octstr()
    );
  });
  const output = headerAsn.encode(
    {
      Number: parseInt(header.number),
      PreviousHash: Buffer.from(header.previous_hash, 'hex'),
      DataHash: Buffer.from(header.data_hash, 'hex')
    },
    'der'
  );
  return sha.sha256(output);
}

exports.setOrgEnrolmentPath = setOrgEnrolmentPath;
exports.cloneConfig = cloneConfig;
exports.validateClientConfig = validateClientConfig;
exports.getBlockTimeStamp = getBlockTimeStamp;
exports.generateBlockHash = generateBlockHash;