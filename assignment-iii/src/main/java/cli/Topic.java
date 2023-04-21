package cli;

import java.util.HashMap;
import java.util.Map;

public class Topic<N> {

    private Map<String, Partition<N>> partitions;
    private Map<String, ConsumerGroup> consumerGroups;

    private Class<N> type;
    private String id;

    public Topic(String id, Class<N> type) {
        this.id = id;
        this.type = type;
        this.partitions = new HashMap<>();
        this.consumerGroups = new HashMap<>();
    }

    public void addPartition(String id) {
        Partition<N> partition = new Partition<>(id);
        partitions.put(id, partition);
    }

    public void addConsumerGroup(String id, String refactor) {
        ConsumerGroup consumerGroup = new ConsumerGroup(id, refactor);
        consumerGroups.put(id, consumerGroup);
    }



    public Partition<N> getPartition(String id) {
        for (Partition<N> partition : partitions.values()) {
            if (partition.getId() == id) {
                return partition;
            }
        }
        return null;
    }
    
}
