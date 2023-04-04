package unsw.blackout;

import unsw.utils.Angle;

public class RelaySatellite extends Satellite {
    public RelaySatellite(String satelliteId, String type, double height, Angle position) {
        super(satelliteId, type, height, position, 300000, 1500, 0, 0);
        this.setClockwise(true);
    }

    @Override
    public void move() {

        if (this.getPosition().toDegrees() <= 140 || this.getPosition().toDegrees() >= 345) {

            this.setClockwise(false);

        } else if (this.getPosition().toDegrees() >= 190 && this.getPosition().toDegrees() < 345) {

            this.setClockwise(true);
        }

        super.move();

    }

    // relay satellites have no capacity
    @Override
    public boolean storage(String fileSize) throws FileTransferException {

        return false;
    }

    @Override
    public boolean checkRecieve() throws FileTransferException {
        return false;
    }

    @Override
    public boolean checkSend() throws FileTransferException {
        return false;
    }

}
