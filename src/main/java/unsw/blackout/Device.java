package unsw.blackout;

import unsw.utils.Angle;

public abstract class Device extends Entity {
    private String deviceId;
    private String type;
    private Angle position;
    private int connectRange;
    private double height = 69911;

    public Device(String deviceId, int range, Angle position) {
        super(deviceId, range, position);

    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = 69911;
    }

    public String getType() {
        return type;
    }

    @Override
    public boolean checkSend() {
        return true;
    }

    @Override
    public boolean checkRecieve() {
        return true;
    }

    @Override
    public boolean storage(String fileSize) {
        return true;
    }

    @Override

    public int sendingByte() {
        return 0;
    }

    @Override
    public int recievingByte() {
        return 0;
    }

}
