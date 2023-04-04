package unsw.blackout;

import unsw.utils.Angle;

public class Laptop extends Device {
    private final String type = "LaptopDevice";

    public Laptop(String deviceId, Angle position) {
        super(deviceId, 100000, position);
        // TODO Auto-generated constructor stub
    }

    public String getType() {
        return this.type;
    }

}
