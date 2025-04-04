class towerData {
    static water = {
        range:100,
        power:20,
        speed:1
    }
    static fire = {
        range:80,
        power:25,
        speed:0.9
    }
    static wind = {
        range:120,
        power:15,
        speed:1.1
    }
    constructor(level, attribute) {
        this.level = level;
        this.attribute = attribute;
        
        this.range = towerData[attribute].range;
        this.power = towerData[attribute].power;
        this.speed = towerData[attribute].speed;
        
        switch (level) {
            case 2:
                this.power *= 1.2
                break;
            case 3:
                this.power *= 1.5
                break;
        }
    }
}