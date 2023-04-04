package unsw.blackout;

import unsw.utils.Angle;

public class Desktop extends Device {
    private final String type = "DesktopDevice";

    public Desktop(String deviceId, Angle position) {
        super(deviceId, 200000, position);
    }

    public String getType() {
        return this.type;
    }

}
