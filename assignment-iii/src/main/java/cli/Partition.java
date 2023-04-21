package cli;

public class Partition<N> {
    private String id;

    public Partition(String id) {
        this.id = id; 
    }
    
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
