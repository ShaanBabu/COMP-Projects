package unsw.blackout;

import unsw.utils.Angle;

public class TeleportingSatellite extends Satellite {
    public TeleportingSatellite(String satelliteId, String type, double height, Angle position) {
        super(satelliteId, type, height, position, 200000, 1000, 15, 10);
    }

    @Override
    public void move() {

        double beforeMoving = (int) (this.getPosition().toDegrees());
        super.move();
        double afterMoving = (int) (this.getPosition().toDegrees());

        if ((beforeMoving == 180 && afterMoving != 180) || (beforeMoving != 180 && afterMoving == 180)) {
            this.setPosition(Angle.fromDegrees(0));
            if (this.isClockwise()) {
                this.setClockwise(false);
            } else {
                this.setClockwise(true);
            }
        }

    }

    @Override
    public boolean storage(String fileSize) throws FileTransferException {
        int store = 0;

        for (File file : this.getRecieved().keySet()) {
            store = store + file.getContent().length();
        }
        for (File file : this.getFiles()) {
            store = store + file.getContent().length();
        }

        int currCapacity = store + fileSize.length();

        // throw file error
        if (currCapacity > 200) {
            throw new FileTransferException.VirtualFileNoStorageSpaceException("Max Storage Reached");
        }

        return true;
    }

}
