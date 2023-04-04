package unsw.blackout;

import unsw.utils.Angle;

public abstract class Satellite extends Entity {
    private String type;
    private double height;
    private double velocity;
    private boolean clockwise;
    private int sending;
    private int recieving;

    public Satellite(String satelliteId, String type, double height, Angle position, int range, int velocity,
            int sending, int recieving) {
        super(satelliteId, range, position);

        this.type = type;
        this.height = height;
        this.velocity = velocity;
        this.sending = sending;
        this.recieving = recieving;

    }

    public String getType() {
        return type;
    }

    public int getSending() {
        return sending;
    }

    public void setSending(int sending) {
        this.sending = sending;
    }

    public int getRecieving() {
        return recieving;
    }

    public void setRecieving(int recieving) {
        this.recieving = recieving;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public boolean isClockwise() {
        return clockwise;
    }

    public void setClockwise(boolean clockwise) {
        this.clockwise = clockwise;
    }

    // public void setPosition(Angle position) {
    // this.position = position;
    // }

    public double getVelocity() {
        return velocity;
    }

    public void setVelocity(double velocity) {
        this.velocity = velocity;
    }

    public double angularVelocity() {
        return (this.getVelocity() / this.getHeight());
    }

    /////////////////// helper functions////////////////////

    @Override
    public boolean checkSend() throws FileTransferException {
        if (this.getSending() > this.getSend().size()) {
            return true;
        }
        throw new FileTransferException.VirtualFileNoBandwidthException(this.getId());
    }

    @Override
    public boolean checkRecieve() throws FileTransferException {
        if (this.getRecieving() > this.getRecieved().size()) {
            return true;
        }
        throw new FileTransferException.VirtualFileNoBandwidthException(this.getId());
    }

    @Override
    public int sendingByte() {
        int send = (int) Math.floor(this.getSending() / this.getSend().size());
        return send;
    }

    @Override
    public int recievingByte() {
        int recieve = (int) Math.floor(this.getRecieving() / this.getRecieved().size());
        return recieve;
    }

    @Override
    public boolean isSattelite() {
        return true;
    }

    public void move() {
        double position = this.getPosition().toRadians();
        if (clockwise) {
            position -= this.angularVelocity();
        } else {
            position += this.angularVelocity();
        }

        position = adjustEdges(position);

        this.setPosition(Angle.fromRadians(position));
    }

    public double adjustEdges(double position) {
        position = position % (2 * Math.PI);
        if (position < 0) {
            position = position + 2 * Math.PI;
        }
        return position;
    }

}
