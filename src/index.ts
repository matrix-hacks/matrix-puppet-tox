import {
  ThirdPartyAdapter,
  
  download, entities,
  
  ThirdPartyPayload, ThirdPartyMessagePayload, ThirdPartyImageMessagePayload,
  UserData, RoomData
} from 'matrix-puppet-bridge';

const debug = require('debug')('matrix-puppet:tox');
import { ToxClient } from './client'

export class Adapter extends ThirdPartyAdapter {
  public serviceName = 'Tox';
  private client: ToxClient;
  startClient(): Promise<void> {
    this.client = new ToxClient();
    return this.client.connect().then(() => {
      debug('waiting a little bit for initial self-messages to fire before listening for messages');
      setTimeout(()=>this.registerMessageListener(), 5000);
    });
  }
  registerMessageListener() {
    this.client.on('message', (data) => {
      this.puppetBridge.sendMessage({
        roomId: data.id,
        senderId: data.id,
        senderName: data.name,
        text: data.message,
      });
    })
  }
  getUserData(id): Promise<UserData>{
    return Promise.resolve(() => {
      let payload = <UserData>{
        name: this.client.getNameById(id),
      };
      return payload;
    });
  }
  getRoomData(id: string): Promise<RoomData> {
    return new Promise<RoomData>((resolve, reject) => {
      const name = this.client.getNameById(id);
      if (!name) {
        return reject();
      }
      let payload = <RoomData>{
        name: name,
        topic: 'Tox Chat ('+name+')',
        isDirect: true,
      };
      return resolve(payload);
    });
  }
  sendMessage(id, text) {
    return this.client.sendMessage(text, id, false);
  }
  getRoomByUser(uid) {
    return this.client.getRoomByUser(uid);
  }
};
