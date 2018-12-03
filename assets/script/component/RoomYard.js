const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class RoomYard extends cc.Component {

    _roomIdx = 1;//这是那个房间

    _isAddThings = false;

    onLoad() {

    }

    initRoom() {
    }
}