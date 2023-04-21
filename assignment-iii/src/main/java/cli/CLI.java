package cli;
import java.util.*;
import java.io.*;
import org.json.simple.*;
import org.json.simple.parser.*;

public class CLI {
    private Map<String, Topic> topics;
    private Map<String, ConsumerGroup> consumerGroups;
    private Map<String, Producer> producers;
    private Map<String, Consumer> consumers;
    

    public CLI() {
        topics = new HashMap<>();
        //consumerGroups = new HashMap<>();
        //producers = new HashMap<>();
    }

    public void createTopic(String id, Class<?> type) {
        Topic<?> topic = new Topic<>(id, type);
        topics.put(id, topic);
        System.out.println("Topic " + id + " of type " + type.getSimpleName() + " created.");
    }

    public void createPartition(String topicId, String partitionId) {
        Topic topic = topics.get(topicId);
        if (topic == null) {
            System.out.println("Topic " + topicId + " does not exist.");
        } else {
            topic.addPartition(partitionId);
            System.out.println("Partition " + partitionId + " created in topic " + topicId);
        }
    }

    public void createConsumerGroup(String id, String topicId, String rebalancing) {
        Topic topic = topics.get(topicId);
        if (topic == null) {
            System.out.println("Topic " + topicId + " does not exist.");
        } else {
            ConsumerGroup consumerGroup = new ConsumerGroup(id, rebalancing);
            // TODO : Add the consumer group the relavent topic
            topic.addConsumerGroup(topicId, rebalancing);
            consumerGroups.put(id, consumerGroup);
            
            System.out.println("Consumer group " + id + " created.");
        }
    }

    public void createConsumer(String groupId, String id) {
        ConsumerGroup consumerGroup = consumerGroups.get(groupId);
        if (consumerGroup == null) {
            System.out.println("Consumer group " + groupId + " does not exist.");
        } else {
            consumerGroup.addConsumer(id);
            System.out.println("Consumer " + id + " created.");
        }
    }

    public void deleteConsumer(String consumerId) {
        Consumer consumerToDelete = null;
        for (ConsumerGroup consumerGroup : consumerGroups.values()) {
            if (consumerGroup.hasConsumer(consumerId)) {
                consumerToDelete = consumerGroup.removeConsumer(consumerId);
                break;
            }
        }
        if (consumerToDelete == null) {
            System.out.println("Consumer " + consumerId + " does not exist.");
        } else {
            System.out.println("Consumer " + consumerId + " deleted from consumer group " + consumerToDelete.getConsumerGroup().getId() + ".");
            System.out.println("Consumer group " + consumerToDelete.getConsumerGroup().getId() + " rebalanced.");
            System.out.println(consumerToDelete.getConsumerGroup().toString());
        }
    }

    public void createProducer(String id, Class<?> type, String allocation) {
        Producer<?> producer = new Producer<>(id, type, allocation);
        producers.put(id, producer);
        System.out.println("Producer " + id + " of type " + type.getSimpleName() + " created.");
    }

    // public void produceEvent(String producerId, String topicId, String eventFilename, String partitionId) {
    //     Producer<?> producer = producers.get(producerId);
    //     if (producer == null) {
    //         System.out.println("Producer " + producerId + " does not exist.");
    //         return;
    //     }
    
    //     Topic<?> topic = topics.get(topicId);
    //     if (topic == null) {
    //         System.out.println("Topic " + topicId + " does not exist.");
    //         return;
    //     }
    
    //     Partition<?> partition = null;
    //     if (partitionId != null) {
    //         partition = topic.getPartition(partitionId);
    //         if (partition == null) {
    //             System.out.println("Partition " + partitionId + " does not exist in topic " + topicId);
    //             return;
    //         }
    //     } 
    //     // else {
    //     //     List<Partition<?>> partitions = topic.getPartitions();
    //     //     partition = partitions.get(random.nextInt(partitions.size()));
    //     // }
    
    //     Gson gson = new Gson();
    //     try {
    //         FileReader reader = new FileReader(new File(eventFilename));
    //         Object event = gson.fromJson(reader, producer.getEventType());
    
    //         boolean success = producer.produce(event, topic, partition);
    //         if (success) {
    //             System.out.println("Event produced to topic " + topicId + ", partition " + partition.getId());
    //         } else {
    //             System.out.println("Failed to produce event to topic " + topicId + ", partition " + partition.getId());
    //         }
    //     } catch (JsonSyntaxException | JsonIOException | IOException e) {
    //         System.out.println("Error while reading event from file " + eventFilename + ": " + e.getMessage());
    //     }
    }


}
