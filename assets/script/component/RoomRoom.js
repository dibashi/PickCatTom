const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class RoomRoom extends cc.Component {

    _roomIdx = 3;//这是那个房间

    _isAddThings = false;

    onLoad() {

    }

    initRoom() {
    }
}