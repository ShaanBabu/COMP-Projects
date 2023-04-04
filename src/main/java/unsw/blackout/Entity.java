package unsw.blackout;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import unsw.utils.Angle;
import unsw.utils.MathsHelper;

public abstract class Entity {
    private List<File> files = new ArrayList<File>();
    private Map<File, Entity> send = new HashMap<>();
    private Map<File, Entity> recieved = new HashMap<>();
    private String id;
    private int range;
    private Angle position;

    public Entity(String id, int range, Angle position) {
        this.id = id;
        this.range = range;
        this.position = position;
    }

    public List<File> getFiles() {
        return this.files;
    }

    public String getId() {
        return id;
    }

    public void setFiles(List<File> files) {
        this.files = files;
    }

    public Map<File, Entity> getSend() {
        return send;
    }

    public void setSend(Map<File, Entity> send) {
        this.send = send;
    }

    public Map<File, Entity> getRecieved() {
        return recieved;
    }

    public void setRecieved(Map<File, Entity> recieved) {
        this.recieved = recieved;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getRange() {
        return range;
    }

    public void setRange(int range) {
        this.range = range;
    }

    public Angle getPosition() {
        return position;
    }

    public void setPosition(Angle position) {
        this.position = position;
    }

    public File addFile(String filename, String content) {
        File newFile = new File(filename, content);

        files.add(newFile);

        return newFile;
    }

    public List<String> collectiveEntities(List<String> entityList, Entity entity, List<Entity> entities) {
        boolean isVisible;
        double distance;

        for (Entity objects : entities) {
            // if id is same, meaning the entities are the same continue to next iteration
            if (this.getId().equals(objects.getId())) {
                continue;
            }
            if (objects.isSattelite()) {
                distance = this.getDistanceSatellite(objects);
                isVisible = this.isVisibleToSatellite(objects);
            } else if (this.isSattelite()) {
                distance = this.getDistanceDevice(objects);
                isVisible = this.isVisibletoDevice(objects);
            } else {
                // you must find an entity; sat or dev that suits current condition
                continue;
            }
            if (distance <= this.getRange() && distance <= objects.getRange() && isVisible
                    && entity.isSupported(objects)) {

                entityList.add(objects.getId());

                if (objects.getType().equals("RelaySatellite")) {
                    // create recursive call for infinite relay satellites
                    entityList = objects.collectiveEntities(entityList, entity, entities);
                }

            }

        }

        return entityList;
    }

    public boolean isVisibleToSatellite(Entity satellite) {
        if (MathsHelper.isVisible(this.getHeight(), this.position, satellite.getHeight(), satellite.getPosition())) {
            return true;
        }
        return false;
    }

    public boolean isVisibletoDevice(Entity device) {
        if (MathsHelper.isVisible(this.getHeight(), this.position, device.getPosition())) {
            return true;
        }
        return false;
    }

    public double getDistanceSatellite(Entity satellite) {
        double satDistance;

        satDistance = MathsHelper.getDistance(this.getHeight(), this.getPosition(), satellite.getHeight(),
                satellite.getPosition());

        return satDistance;

    }

    public double getDistanceDevice(Entity device) {
        double devDistance;

        devDistance = MathsHelper.getDistance(this.getHeight(), this.getPosition(), device.getPosition());

        return devDistance;
    }

    public boolean isSupported(Entity dev) {
        if (this instanceof StandardSatellite && dev instanceof Desktop) {
            return false;

        } else if (dev instanceof StandardSatellite && this instanceof Desktop) {
            return false;
        }

        return true;
    }

    public void updateFilePosition(List<Entity> entities) {
        Entity entityReceivingFile;
        ArrayList<String> gatherEntity = new ArrayList<String>();

        for (File f : this.send.keySet()) {
            entityReceivingFile = this.send.get(f);
            if (entityReceivingFile != null
                    && this.collectiveEntities(gatherEntity, this, entities).contains(entityReceivingFile.getId())) {
                if (!entityReceivingFile.fileSend(f, this.sendingByte(), entityReceivingFile.recievingByte())) {
                    this.send.remove(f);
                    entityReceivingFile.recieved.remove(f);
                    break;
                }
            } else {
                this.removeFileWhenOutOfRange(entityReceivingFile);
            }

        }

    }

    public boolean fileSend(File f, int sendByte, int recieveByte) {
        int sendingTime = 0;
        // sets highest bandwidth in case one end is 0 already...meaning it will pick
        // the side with highest value
        if (recieveByte == 0 || sendByte == 0) {
            if (sendByte > recieveByte) {
                sendingTime = sendByte;
            } else {
                sendingTime = recieveByte;
            }
        } else {
            // sets smallest value of bandwidth between the sending and recieving limits
            sendingTime = (sendByte < recieveByte) ? sendByte : recieveByte;
        }

        for (File file : this.files) {
            if (file.getFilename().equals(f.getFilename())) {
                for (int counter = 0; counter < sendingTime; counter++) {
                    if (file.getContent().length() < f.getContent().length()) {
                        file.setContent(file.getContent().substring(file.getContent().length()) + f.getContent());
                    } else {
                        return false;
                    }
                }
                if (file.getContent().length() < f.getContent().length()) {
                    return true;
                }
            }
        }
        return false;
    }

    public void removeFileWhenOutOfRange(Entity sat) {
        List<File> incompleteFiles = new ArrayList<File>();

        for (File file : this.send.keySet()) {
            if (this.send.get(file).getId().equals(sat.getId()) && this.send.get(file) != null) {
                sat.fileDispose(file.getFilename());
                // add file to incompelte transfer reuests
                incompleteFiles.add(file);
            }

        }
        for (File file : incompleteFiles) {
            this.send.remove(file);
        }
        incompleteFiles.clear();

        Iterator<Map.Entry<File, Entity>> iterator = sat.recieved.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<File, Entity> entry = iterator.next();
            if (entry.getValue().getId().equals(this.getId())) {
                iterator.remove();
            }
        }

        for (File file : incompleteFiles) {
            sat.recieved.remove(file);
        }
    }

    public boolean isSattelite() {
        return false;
    }

    public void fileDispose(String name) {
        this.files = this.files.stream().filter(f -> !f.getFilename().equals(name)).collect(Collectors.toList());
    }

    public abstract boolean checkSend() throws FileTransferException;

    public abstract boolean checkRecieve() throws FileTransferException;

    public abstract boolean storage(String fileSize) throws FileTransferException;

    public abstract int sendingByte();

    public abstract int recievingByte();

    public abstract double getHeight();

    public abstract String getType();

}
