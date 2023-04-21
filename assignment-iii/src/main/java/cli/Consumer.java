package cli;

public class Consumer {
    private ConsumerGroup consumerGroup;
    private String id;

    public Consumer(String id, ConsumerGroup consumerGroup) {
        this.id = id;
        this.consumerGroup = consumerGroup;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ConsumerGroup getConsumerGroup() {
        return consumerGroup;
    }
    
    
}
