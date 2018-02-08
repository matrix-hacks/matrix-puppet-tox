import * as toxcore from 'toxcore';
import * as Promise from 'bluebird';
const debug = require('debug')('matrix-puppet:tox:client');
export const EventEmitter = require('events').EventEmitter;

Promise.promisifyAll(toxcore);

const nodes = [
  { maintainer: 'saneki',
    address: '96.31.85.154',
    port: 33445,
    key: '674153CF49616CD1C4ADF44B004686FC1F6C9DCDD048EF89B117B3F02AA0B778' },
  { maintainer: 'Impyy',
    address: '178.62.250.138',
    port: 33445,
    key: '788236D34978D1D5BD822F0A5BEBD2C53C64CC31CD3149350EE27D4D9A2F9B6B' },
  { maintainer: 'sonOfRa',
    address: '144.76.60.215',
    port: 33445,
    key: '04119E835DF3E78BACF0F84235B300546AF8B936F035185E2A8E9E0A67C8924F' }
];

export class ToxClient extends (EventEmitter as { new(): any; }) {
  constructor() {
    super();
    this.tox = new toxcore.Tox({
      data: '/home/sorunome/.config/tox/tox_save_test.tox',
      path: '/home/sorunome/repos/matrix-puppet-tox/lib/libtoxcore.so',
      crypto: '/home/sorunome/repos/matrix-puppet-tox/lib/libtoxencryptsave.so',
    });
  }
  connect() {
    return Promise.map(nodes, (node) => {
      return this.tox.bootstrapAsync(node.address, node.port, node.key);
    }).then(this.tox.setNameAsync('Soruteeeest'))
    .then(this.tox.setStatusMessageAsync('testing tox'))
    .then(() => {
      // init callbacks
      
      // Listen for friend requests
      this.tox.on('friendRequest', (e) => {
        console.log('Friend request from: ' + e.publicKeyHex());
      });

      // Print received friend messages to console
      this.tox.on('friendMessage', (e) => {
        var friendName = this.getNameById(e.friend());
        this.emit('message', {
          name: friendName,
          id: this.tox.getFriendPublicKeyHexSync(e.friend()),
          message: e.message(),
          action: e._messageType == 1
        });
      });
    })
    .then(() => {
      this.tox.start();
    });
  }
  sendMessage(text, channel, action) {
    return this.tox.sendFriendMessageAsync(channel, text, action);
  }
  getSelfUserId() {
    return this.tox.getAddressHexAsync();
  }
  getNameById(id) {
    return this.tox.getFriendNameSync(id).replace(/\0/g, '');
  }
}
