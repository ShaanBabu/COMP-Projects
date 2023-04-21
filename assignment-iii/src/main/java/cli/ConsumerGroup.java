package cli;

import java.util.Map;

public class ConsumerGroup {

    private Map<String, Consumer> consumers;

    private String id;
    //private Strat rebalancingStrat

    public ConsumerGroup(String id, String rebalancing) {
        this.id = id;
        switch(rebalancing) {
            case "Range":
                // set range 
            case "RoundRobin":
                // set RoundRobin strat
            default:
                // uhh shouldnt happen
        }
    }

    public void addConsumer(String id) {
        Consumer consumer = new Consumer(id, this);
        consumers.put(id, consumer);
    }

    public boolean hasConsumer(String consumerId) {
        for (Consumer consumer : consumers.values()) {
            if (consumer.getId() == consumerId) {
                return true;
            }
        }
        return false;
    }

    public Consumer removeConsumer(String consumerId) {
        return null;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    
}
