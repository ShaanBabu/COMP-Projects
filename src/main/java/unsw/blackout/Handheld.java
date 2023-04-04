package unsw.blackout;

import unsw.utils.Angle;

public class Handheld extends Device {
    private final String type = "HandheldDevice";

    public Handheld(String deviceId, Angle position) {
        super(deviceId, 50000, position);
    }

    public String getType() {
        return this.type;
    }

}
