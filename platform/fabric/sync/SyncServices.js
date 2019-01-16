const logger = require('../../../common/log4js').getLogger('SyncService');
const FabricUtils = require('../utils/FabricUtils');
const convertHex = require('convert-hex');
const grpc = require('grpc');
const path = require('path');
const legalClient = require('../legal-client');
const CURDServices = require('../../../dbs/CRUDService');
const config = require('../config.json');

const _transProto = grpc.load(
  path.resolve(__dirname, '../../../node_modules/fabric-client/lib/protos/peer/transaction.proto')
).protos;

// transaction validation code
const _validation_codes = {};
const keys = Object.keys(_transProto.TxValidationCode);
for (let i = 0; i < keys.length; i++) {
  const new_key = _transProto.TxValidationCode[keys[i]];
  _validation_codes[new_key] = keys[i];
}

// transaction validation code
function convertValidationCode(code) {
  if (typeof code === 'string') {
    return code;
  }
  return _validation_codes[code];
}

class SyncServices {
  constructor (username = 'admin', userorg = 'Org1') {
    this.client;
    this.userorg = userorg;
    this.username = username;
    this.defaultPeer = {};
    this.defaultChannel = {};
    this.peer = {};
    this.curdservices;
  }
  async initialize () {
    const defaultChannelName = await this.client.getConfigSetting('channelName');
    const defaultPeerName = await this.client.getConfigSetting('peerName');
    this.defaultChannel = await this.client.getChannel(defaultChannelName, true);
    this.defaultPeer = this.defaultChannel.getPeer(defaultPeerName);
    this.curdservices = new CURDServices();
  }
  async getAllBlocks (channelName) {
    this.client = await legalClient.getRegisteredUser(this.username, this.userorg, true);
    await this.getPeers();
    setInterval(async () => {
      let channel = this.client.getChannel(channelName, true);
      await this.getChannels();
      let height = 0;
      let peer = channel.getChannelPeers()[0]
      let channelInfo = await channel.queryInfo(peer);
      height = channelInfo.height.low;
      logger.info('blockHeight ----> ', height, '\n');
      logger.info('queryInfo ----> ', JSON.stringify(channelInfo), '\n');
      for (let blockNum = 0 ; blockNum < height ; blockNum++) {
        let block = await channel.queryBlock(
          blockNum,
          peer,
          true
        )
        let blockRow = await this.getBlockRow(block);
        await this.getTransactionRow(block);
        logger.info('blockInfo ----> ', JSON.stringify(blockRow), '\n');
      }
    }, config.blocksSyncTime);
  }
  async getBlockRow (block) {
    // get the first transaction
    const first_tx = block.data.data[0];
    // the 'header' object contains metadata of the transaction
    const header = first_tx.payload.header;
    const channel_name = header.channel_header.channel_id;
    // let channel_genesis_hash = client.getChannelGenHash(channel_name);
    const createdt = await FabricUtils.getBlockTimeStamp(
      header.channel_header.timestamp
    );
    const blockhash = await FabricUtils.generateBlockHash(block.header);
    // 组装区块数据
    let block_row = {
      blocknum: block.header.number,
      datahash: block.header.data_hash,
      prehash: block.header.previous_hash,
      txcount: block.data.data.length,
      createdt,
      blockhash
    }
    await this.curdservices.saveBlockRow(block_row);
    return block_row;
  }
  async getTransactionRow (block) {
    const txLen = block.data.data.length;
    for (let i = 0 ; i < txLen ; i++) {
      const txObj = block.data.data[i];
      const txid = txObj.payload.header.channel_header.tx_id;
      let validation_code = '';
      let endorser_signature = '';
      let payload_proposal_hash = '';
      let endorser_id_bytes = '';
      let chaincode_proposal_input = '';
      let chaincode = '';
      let rwset;
      let readSet;
      let writeSet;
      let chaincodeID;
      let status;
      let mspId = [];
      let envelope_signature = txObj.signature;
      if (txid != undefined && txid != '') {
        const validation_codes = block.metadata.metadata[block.metadata.metadata.length - 1];
        const val_code = validation_codes[i];
        validation_code = convertValidationCode(val_code);
      }
      if (envelope_signature != undefined) {
        envelope_signature = convertHex.bytesToHex(envelope_signature);
      }
      let payload_extension = txObj.payload.header.channel_header.extension;
      if (payload_extension != undefined) {
        payload_extension = convertHex.bytesToHex(payload_extension);
      }
      let creator_nonce = txObj.payload.header.signature_header.nonce;
      if (creator_nonce != undefined) {
        creator_nonce = convertHex.bytesToHex(creator_nonce);
      }
      const creator_id_bytes =
        txObj.payload.header.signature_header.creator.IdBytes;
      if (txObj.payload.data.actions != undefined) {
        chaincode =
          txObj.payload.data.actions[0].payload.action
            .proposal_response_payload.extension.chaincode_id.name;
        chaincodeID = new Uint8Array(
          txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension
        );
        status =
          txObj.payload.data.actions[0].payload.action
            .proposal_response_payload.extension.response.status;
        mspId = txObj.payload.data.actions[0].payload.action.endorsements.map(
          i => i.endorser.Mspid
        );
        rwset =
          txObj.payload.data.actions[0].payload.action
            .proposal_response_payload.extension.results.ns_rwset;
        readSet = rwset.map(i => ({
          chaincode: i.namespace,
          set: i.rwset.reads
        }));
        writeSet = rwset.map(i => ({
          chaincode: i.namespace,
          set: i.rwset.writes
        }));
        chaincode_proposal_input =
          txObj.payload.data.actions[0].payload.chaincode_proposal_payload
            .input.chaincode_spec.input.args;
        if (chaincode_proposal_input != undefined) {
          let inputs = '';
          for (const input of chaincode_proposal_input) {
            inputs =
              (inputs === '' ? inputs : `${inputs},`) +
              convertHex.bytesToHex(input);
          }
          chaincode_proposal_input = inputs;
        }
        endorser_signature =
          txObj.payload.data.actions[0].payload.action.endorsements[0]
            .signature;
        if (endorser_signature != undefined) {
          endorser_signature = convertHex.bytesToHex(endorser_signature);
        }
        payload_proposal_hash =
          txObj.payload.data.actions[0].payload.action
            .proposal_response_payload.proposal_hash;
        endorser_id_bytes =
          txObj.payload.data.actions[0].payload.action.endorsements[0]
            .endorser.IdBytes;
      }
      const read_set = JSON.stringify(readSet, null, 2);
      const write_set = JSON.stringify(writeSet, null, 2);

      if (typeof read_set === 'string' || read_set instanceof String) {
        console.log('read_set length', read_set.length);
        const bytes = Buffer.byteLength(write_set, 'utf8');
        const kb = (bytes + 512) / 1024;
        const mb = (kb + 512) / 1024;
        const size = `${mb} MB`;
        console.log('write_set size >>>>>>>>> : ', size);
      }
      const createdt = await FabricUtils.getBlockTimeStamp(
        txObj.payload.header.channel_header.timestamp
      )
      const chaincode_id = String.fromCharCode.apply(null, chaincodeID);
      const transaction_row = {
        blockid: block.header.number,
        txhash: txid,
        createdt,
        chaincodename: chaincode,
        chaincode_id,
        status,
        creator_msp_id: txObj.payload.header.signature_header.creator.Mspid,
        endorser_msp_id: mspId,
        type: txObj.payload.header.channel_header.typeString,
        read_set,
        write_set,
        validation_code,
        envelope_signature,
        payload_extension,
        creator_nonce,
        chaincode_proposal_input,
        endorser_signature,
        creator_id_bytes,
        payload_proposal_hash,
        endorser_id_bytes
      };
      await this.curdservices.saveTransactionRow(transaction_row);
    }
  }
  async getChannels () {
    await this.initialize();
    let channels = await this.client.queryChannels(
      this.defaultPeer.getName(),
      true
    );
    logger.info('channels ----->\n', channels);
  }
  async getPeers () {
    await this.initialize();
    let peers = await this.defaultChannel.getChannelPeers();
    peers.forEach(async (item, index) => {
      let channelInfo = await this.defaultChannel.queryInfo(item);
      let mspId = await item.getMspid();
      let name = await item.getName();
      let url = await item.getUrl();
      let peer = {
        ledger_height_high: channelInfo.height.high,
        ledger_height_low: channelInfo.height.low,
        ledger_height_unsigned: channelInfo.height.unsigned,
        mspid: mspId,
        peer_type: 'PEER',
        requests: url,
        server_hostname: name,
        status: 'RUNNING',
      }
      await this.curdservices.savePeerRow(peer);
    })
  }
}

module.exports = SyncServices;
