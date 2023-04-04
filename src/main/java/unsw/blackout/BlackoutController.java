package unsw.blackout;

import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import unsw.response.models.EntityInfoResponse;
import unsw.response.models.FileInfoResponse;
import unsw.utils.Angle;

public class BlackoutController {
    private ArrayList<Satellite> satellites = new ArrayList<Satellite>();
    private List<Device> devices = new ArrayList<Device>();
    private List<Entity> entities = new ArrayList<Entity>();

    public void createDevice(String deviceId, String type, Angle position) {

        if (type.equals("HandheldDevice")) {
            Handheld newDevice = new Handheld(deviceId, position);
            devices.add(newDevice);
            entities.add(newDevice);
        }
        if (type.equals("LaptopDevice")) {
            Laptop newDevice = new Laptop(deviceId, position);
            devices.add(newDevice);
            entities.add(newDevice);

        }
        if (type.equals("DesktopDevice")) {
            Desktop newDevice = new Desktop(deviceId, position);
            devices.add(newDevice);
            entities.add(newDevice);
        }
    }

    public void removeDevice(String deviceId) {

        devices.remove(checkDeviceId(deviceId));
        entities.remove(checkEntityId(deviceId));
    }

    public void createSatellite(String satelliteId, String type, double height, Angle position) {

        if (type.equals("StandardSatellite")) {
            StandardSatellite newSatellite = new StandardSatellite(satelliteId, type, height, position);
            satellites.add(newSatellite);
            entities.add(newSatellite);
        }
        if (type.equals("TeleportingSatellite")) {
            TeleportingSatellite newSatellite = new TeleportingSatellite(satelliteId, type, height, position);
            satellites.add(newSatellite);
            entities.add(newSatellite);
        }
        if (type.equals("RelaySatellite")) {
            RelaySatellite newSatellite = new RelaySatellite(satelliteId, type, height, position);
            satellites.add(newSatellite);
            entities.add(newSatellite);
        }
    }

    public void removeSatellite(String satelliteId) {

        satellites.remove(checkSatelliteId(satelliteId));
        entities.remove(checkEntityId(satelliteId));

    }

    public List<String> listDeviceIds() {

        ArrayList<String> deviceListing = new ArrayList<String>();

        for (Device d : devices) {
            deviceListing.add(d.getId());
        }

        return deviceListing;
    }

    public List<String> listSatelliteIds() {

        ArrayList<String> satelliteListing = new ArrayList<String>();

        for (Satellite s : satellites) {
            satelliteListing.add(s.getId());
        }

        return satelliteListing;
    }

    public void addFileToDevice(String deviceId, String filename, String content) {

        for (Device device : devices) {
            if (device.getId().equals(deviceId)) {
                device.addFile(filename, content);
            }
        }

    }

    public EntityInfoResponse getInfo(String id) {

        Map<String, String> fileCompilation = new HashMap<>();
        Map<String, FileInfoResponse> completeFile = new HashMap<>();

        for (Entity entity : entities) {
            if (checkEqualId(id, entity)) {
                for (File file : entity.getRecieved().keySet()) {
                    fileCompilation.put(file.getFilename(), file.getContent());
                }
                for (File file : entity.getFiles()) {
                    if (fileCompilation.get(file.getFilename()) == null) {
                        completeFile.put(file.getFilename(), new FileInfoResponse(file.getFilename(), file.getContent(),
                                file.getContent().length(), true));
                    } else {
                        completeFile.put(file.getFilename(), new FileInfoResponse(file.getFilename(), file.getContent(),
                                fileCompilation.get(file.getFilename()).length(), false));
                    }

                }
                return new EntityInfoResponse(id, entity.getPosition(), entity.getHeight(), entity.getType(),
                        completeFile);
            }
        }

        return null;
    }

    public void simulate() {
        updateSatellitePossitions();
        updateFileLocation();
    }

    /**
     * Simulate for the specified number of minutes. You shouldn't need to modify
     * this function.
     */
    public void simulate(int numberOfMinutes) {
        for (int i = 0; i < numberOfMinutes; i++) {
            simulate();
        }
    }

    public List<String> communicableEntitiesInRange(String id) {

        List<String> entityList = new ArrayList<String>();

        for (Entity entity : entities) {
            if (checkEqualId(id, entity)) {
                // check for all objects in range of this particular entity
                entityList = entity.collectiveEntities(entityList, entity, entities);
            }
        }
        // remove any duplicates that may be present
        HashSet<String> entityListWithoutDuplicates = new HashSet<>(entityList);
        List<String> completeEntityList = new ArrayList<>(entityListWithoutDuplicates);

        return completeEntityList;
    }

    public void sendFile(String fileName, String fromId, String toId) throws FileTransferException {

        // create empty file that needs to be sent
        File f = null;
        // create empty entity (i.e. devices or satellites)
        Entity entitySending = checkEntityId(fromId);
        Entity entityReceivingFile = checkEntityId(toId);

        // check if current file equals given file in argument
        for (File files : entitySending.getFiles()) {
            if (files.getFilename().equals(fileName)) {
                f = files;
            }
        }
        // if file is empty or the reciever has already recieved the file throw error.
        if (f == null || entityReceivingFile.getRecieved().containsKey(f)) {
            throw new FileTransferException.VirtualFileNotFoundException(fileName);
        }
        // if file is already there throw error
        for (File fileOutBound : entityReceivingFile.getFiles()) {
            if (fileOutBound.getFilename().equals(fileName)) {
                throw new FileTransferException.VirtualFileAlreadyExistsException(fileName);
            }
        }

        if (entitySending.checkSend()) {
            if (entityReceivingFile.checkRecieve()) {
                if (entityReceivingFile.storage(f.getContent())) {
                    entityReceivingFile.getRecieved().put(f, entitySending);
                    entitySending.getSend().put(f, entityReceivingFile);
                    entityReceivingFile.addFile(f.getFilename(), "");
                }
            }

        }

    }

    public void createDevice(String deviceId, String type, Angle position, boolean isMoving) {
        createDevice(deviceId, type, position);

    }

    public void createSlope(int startAngle, int endAngle, int gradient) {
        // If you are not completing Task 3 you can leave this method blank :)

    }

    private Device checkDeviceId(String id) {
        for (Device d : devices) {
            if (d.getId().equals(id)) {
                return d;
            }

        }
        return null;
    }

    private Satellite checkSatelliteId(String id) {
        for (Satellite s : satellites) {
            if (s.getId().equals(id)) {
                return s;
            }
        }
        return null;
    }

    private Entity checkEntityId(String id) {
        for (Entity entity : entities) {
            if (checkEqualId(id, entity)) {
                return entity;
            }
        }
        return null;
    }

    public void updateSatellitePossitions() {
        for (Satellite s : satellites) {
            s.move();

        }
    }

    public void updateFileLocation() {
        for (Entity entity : entities) {
            entity.updateFilePosition(entities);
        }
    }

    public boolean checkEqualId(String id, Entity e) {
        if (e.getId().equals(id)) {
            return true;
        }
        return false;

    }

}
