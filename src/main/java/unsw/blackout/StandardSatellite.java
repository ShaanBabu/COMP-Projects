package unsw.blackout;

import unsw.utils.Angle;

public class StandardSatellite extends Satellite {
    public StandardSatellite(String satelliteId, String type, double height, Angle position) {
        super(satelliteId, type, height, position, 150000, 2500, 1, 1);
    }

    @Override
    public void move() {

        this.setClockwise(true);

        super.move();

    }

    @Override
    public boolean checkRecieve() throws FileTransferException {
        if (this.getRecieving() > this.getRecieved().size()) {
            return true;
        }
        if (this.getFiles().size() >= 3) {
            throw new FileTransferException.VirtualFileNoStorageSpaceException("Max File Reached");
        }
        throw new FileTransferException.VirtualFileNoBandwidthException(this.getId());
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
        if (currCapacity > 80) {
            throw new FileTransferException.VirtualFileNoStorageSpaceException("Max Storage Reached");
        }

        return true;
    }

}
